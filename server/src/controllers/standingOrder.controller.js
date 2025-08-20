const { StandingOrder, Account, User } = require('../models');
const AuditService = require('../services/audit.service');
const { AppError } = require('../utils/error.utils');
const { catchAsync } = require('../middleware/error.middleware');
const { requestLogger: logger } = require('../middleware/logger.middleware');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @desc Get all standing orders for user
 * @route GET /api/standing-orders
 * @access Private
 */
const getStandingOrders = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { page = 1, limit = 20, status, frequency } = req.query;

    // Get user's account IDs
    const userAccounts = await Account.findAll({
        where: { user_id: userId },
        attributes: ['id']
    });

    const accountIds = userAccounts.map(acc => acc.id);

    if (accountIds.length === 0) {
        return res.json({
            success: true,
            data: {
                standing_orders: [],
                pagination: {
                    current_page: 1,
                    total_pages: 0,
                    total_records: 0,
                    per_page: parseInt(limit)
                }
            }
        });
    }

    // Build where clause
    const whereClause = {
        from_account_id: { [Op.in]: accountIds }
    };

    if (status) {
        whereClause.status = status;
    }

    if (frequency) {
        whereClause.frequency = frequency;
    }

    // Get standing orders with pagination
    const offset = (page - 1) * limit;
    const { count, rows: standingOrders } = await StandingOrder.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: Account,
                as: 'fromAccount',
                attributes: ['id', 'account_number', 'account_type', 'name'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username']
                    }
                ]
            },
            {
                model: Account,
                as: 'toAccount',
                attributes: ['id', 'account_number', 'account_type', 'name'],
                required: false // Allow null for external accounts
            }
        ],
        order: [['next_execution_date', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
        success: true,
        data: {
            standing_orders: standingOrders,
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: count,
                per_page: parseInt(limit)
            }
        }
    });
});

/**
 * @desc Get standing order by ID
 * @route GET /api/standing-orders/:id
 * @access Private
 */
const getStandingOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Get user's account IDs
    const userAccounts = await Account.findAll({
        where: { user_id: userId },
        attributes: ['id']
    });

    const accountIds = userAccounts.map(acc => acc.id);

    const standingOrder = await StandingOrder.findOne({
        where: {
            id,
            from_account_id: { [Op.in]: accountIds }
        },
        include: [
            {
                model: Account,
                as: 'fromAccount',
                attributes: ['id', 'account_number', 'account_type', 'name']
            },
            {
                model: Account,
                as: 'toAccount',
                attributes: ['id', 'account_number', 'account_type', 'name'],
                required: false
            }
        ]
    });

    if (!standingOrder) {
        throw new AppError('Standing order not found', 404);
    }

    res.json({
        success: true,
        data: { standing_order: standingOrder }
    });
});

/**
 * @desc Create new standing order
 * @route POST /api/standing-orders
 * @access Private
 */
const createStandingOrder = catchAsync(async (req, res, next) => {
    const {
        from_account_id,
        to_account_number,
        beneficiary_name,
        amount,
        frequency,
        start_date,
        end_date,
        max_executions,
        reference,
        description = ''
    } = req.body;
    const userId = req.user.id;

    // Log standing order creation request to system logs (money-related)
    await AuditService.logSystem({
        level: 'info',
        message: `Creating standing order: ${amount} from account ${from_account_id}`,
        service: 'standing_order_management',
        meta: {
            userId,
            fromAccountId: from_account_id,
            toAccountId: to_account_id,
            amount: parseFloat(amount),
            frequency,
            startDate: start_date,
            endDate: end_date,
            maxExecutions: max_executions,
            operationType: 'standing_order_creation_request'
        }
    });

    // Start transaction
    const t = await sequelize.transaction();

    try {
        // Validate amount
        const orderAmount = parseFloat(amount);
        if (orderAmount <= 0) {
            throw new AppError('Amount must be greater than 0', 400);
        }

        // Get source account and verify ownership
        const fromAccount = await Account.findOne({
            where: {
                id: from_account_id,
                user_id: userId,
                is_active: true
            },
            transaction: t
        });

        if (!fromAccount) {
            throw new AppError('Source account not found', 404);
        }

        // Find destination account (could be null for external accounts)
        let toAccount = null;
        if (to_account_number) {
            toAccount = await Account.findOne({
                where: {
                    account_number: to_account_number,
                    is_active: true
                },
                transaction: t
            });
        }

        // Create standing order
        const standingOrder = await StandingOrder.create({
            from_account_id: fromAccount.id,
            to_account_id: toAccount ? toAccount.id : null,
            external_account_number: toAccount ? null : to_account_number,
            beneficiary_name,
            amount: orderAmount,
            frequency,
            start_date: new Date(start_date),
            end_date: end_date ? new Date(end_date) : null,
            next_execution_date: new Date(start_date),
            max_executions: max_executions || null,
            reference,
            description,
            status: 'active',
            created_by: userId
        }, { transaction: t });

        // Commit transaction
        await t.commit();

        logger.info(`Standing order created: ${standingOrder.id}`);

        // Log audit event
        await AuditService.logTransaction({
            action: 'standing_order_created',
            req,
            transaction: standingOrder,
            details: {
                fromAccountNumber: fromAccount.account_number,
                toAccountNumber: to_account_number,
                beneficiaryName: beneficiary_name,
                frequency,
                amount: orderAmount
            }
        });

        // Get the complete standing order data
        const completeStandingOrder = await StandingOrder.findByPk(standingOrder.id, {
            include: [
                {
                    model: Account,
                    as: 'fromAccount',
                    attributes: ['id', 'account_number', 'account_type', 'name']
                },
                {
                    model: Account,
                    as: 'toAccount',
                    attributes: ['id', 'account_number', 'account_type', 'name'],
                    required: false
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Standing order created successfully',
            data: { standing_order: completeStandingOrder }
        });

    } catch (error) {
        await t.rollback();
        throw error;
    }
});

/**
 * @desc Update standing order
 * @route PUT /api/standing-orders/:id
 * @access Private
 */
const updateStandingOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Get user's account IDs
    const userAccounts = await Account.findAll({
        where: { user_id: userId },
        attributes: ['id']
    });

    const accountIds = userAccounts.map(acc => acc.id);

    const standingOrder = await StandingOrder.findOne({
        where: {
            id,
            from_account_id: { [Op.in]: accountIds }
        }
    });

    if (!standingOrder) {
        throw new AppError('Standing order not found', 404);
    }

    // Prevent updates to completed or cancelled orders
    if (standingOrder.status === 'completed' || standingOrder.status === 'cancelled') {
        throw new AppError('Cannot update completed or cancelled standing orders', 400);
    }

    // Update the standing order
    await standingOrder.update(updateData);

    logger.info(`Standing order updated: ${id}`);

    // Log audit event
    await AuditService.logTransaction({
        action: 'standing_order_updated',
        req,
        transaction: standingOrder,
        details: {
            updatedFields: Object.keys(updateData),
            standingOrderId: id
        }
    });

    // Get updated data with associations
    const updatedStandingOrder = await StandingOrder.findByPk(standingOrder.id, {
        include: [
            {
                model: Account,
                as: 'fromAccount',
                attributes: ['id', 'account_number', 'account_type', 'name']
            },
            {
                model: Account,
                as: 'toAccount',
                attributes: ['id', 'account_number', 'account_type', 'name'],
                required: false
            }
        ]
    });

    res.json({
        success: true,
        message: 'Standing order updated successfully',
        data: { standing_order: updatedStandingOrder }
    });
});

/**
 * @desc Toggle standing order status (pause/resume)
 * @route PUT /api/standing-orders/:id/toggle
 * @access Private
 */
const toggleStandingOrderStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Get user's account IDs
    const userAccounts = await Account.findAll({
        where: { user_id: userId },
        attributes: ['id']
    });

    const accountIds = userAccounts.map(acc => acc.id);

    const standingOrder = await StandingOrder.findOne({
        where: {
            id,
            from_account_id: { [Op.in]: accountIds }
        }
    });

    if (!standingOrder) {
        throw new AppError('Standing order not found', 404);
    }

    // Toggle between active and paused
    const newStatus = standingOrder.status === 'active' ? 'paused' : 'active';

    // Prevent toggle for completed or cancelled orders
    if (standingOrder.status === 'completed' || standingOrder.status === 'cancelled') {
        throw new AppError('Cannot toggle completed or cancelled standing orders', 400);
    }

    await standingOrder.update({ status: newStatus });

    logger.info(`Standing order ${newStatus}: ${id}`);

    // Log audit event
    await AuditService.logTransaction({
        action: `standing_order_${newStatus}`,
        req,
        transaction: standingOrder,
        details: {
            previousStatus: standingOrder.status === 'active' ? 'paused' : 'active',
            newStatus,
            standingOrderId: id
        }
    });

    res.json({
        success: true,
        message: `Standing order ${newStatus} successfully`,
        data: { standing_order: standingOrder }
    });
});

/**
 * @desc Cancel standing order
 * @route DELETE /api/standing-orders/:id
 * @access Private
 */
const cancelStandingOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Get user's account IDs
    const userAccounts = await Account.findAll({
        where: { user_id: userId },
        attributes: ['id']
    });

    const accountIds = userAccounts.map(acc => acc.id);

    const standingOrder = await StandingOrder.findOne({
        where: {
            id,
            from_account_id: { [Op.in]: accountIds }
        }
    });

    if (!standingOrder) {
        throw new AppError('Standing order not found', 404);
    }

    // Update status to cancelled instead of hard delete
    await standingOrder.update({
        status: 'cancelled',
        end_date: new Date()
    });

    logger.info(`Standing order cancelled: ${id}`);

    // Log audit event
    await AuditService.logTransaction({
        action: 'standing_order_cancelled',
        req,
        transaction: standingOrder,
        details: {
            standingOrderId: id,
            cancelledAt: new Date()
        }
    });

    res.json({
        success: true,
        message: 'Standing order cancelled successfully',
        data: { standing_order: standingOrder }
    });
});

module.exports = {
    getStandingOrders,
    getStandingOrder,
    createStandingOrder,
    updateStandingOrder,
    toggleStandingOrderStatus,
    cancelStandingOrder
};
