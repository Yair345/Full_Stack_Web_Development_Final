const { Transaction, Account, User } = require('../models');
const { AppError } = require('../utils/error.utils');
const { asyncHandler } = require('../middleware/error.middleware');
const { requestLogger: logger } = require('../middleware/logger.middleware');
const { emitBalanceUpdate, emitNewTransaction, emitTransactionUpdate } = require('../websocket/socket');
const { Op, sequelize } = require('sequelize');

/**
 * @desc Get all transactions for user
 * @route GET /api/transactions
 * @access Private
 */
const getTransactions = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const {
        page = 1,
        limit = 20,
        type,
        status,
        start_date,
        end_date,
        account_id
    } = req.query;

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
                transactions: [],
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
        [Op.or]: [
            { from_account_id: { [Op.in]: accountIds } },
            { to_account_id: { [Op.in]: accountIds } }
        ]
    };

    if (type) {
        whereClause.transaction_type = type;
    }

    if (status) {
        whereClause.status = status;
    }

    if (account_id) {
        whereClause[Op.or] = [
            { from_account_id: account_id },
            { to_account_id: account_id }
        ];
    }

    if (start_date || end_date) {
        whereClause.created_at = {};
        if (start_date) {
            whereClause.created_at[Op.gte] = new Date(start_date);
        }
        if (end_date) {
            whereClause.created_at[Op.lte] = new Date(end_date);
        }
    }

    // Get transactions with pagination
    const offset = (page - 1) * limit;
    const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: Account,
                as: 'fromAccount',
                attributes: ['id', 'account_number', 'account_type'],
                include: [
                    {
                        model: User,
                        attributes: ['id', 'username']
                    }
                ]
            },
            {
                model: Account,
                as: 'toAccount',
                attributes: ['id', 'account_number', 'account_type'],
                include: [
                    {
                        model: User,
                        attributes: ['id', 'username']
                    }
                ]
            }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
        success: true,
        data: {
            transactions,
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
 * @desc Get transaction by ID
 * @route GET /api/transactions/:id
 * @access Private
 */
const getTransaction = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Get user's account IDs
    const userAccounts = await Account.findAll({
        where: { user_id: userId },
        attributes: ['id']
    });

    const accountIds = userAccounts.map(acc => acc.id);

    const transaction = await Transaction.findOne({
        where: {
            id,
            [Op.or]: [
                { from_account_id: { [Op.in]: accountIds } },
                { to_account_id: { [Op.in]: accountIds } }
            ]
        },
        include: [
            {
                model: Account,
                as: 'fromAccount',
                attributes: ['id', 'account_number', 'account_type'],
                include: [
                    {
                        model: User,
                        attributes: ['id', 'username']
                    }
                ]
            },
            {
                model: Account,
                as: 'toAccount',
                attributes: ['id', 'account_number', 'account_type'],
                include: [
                    {
                        model: User,
                        attributes: ['id', 'username']
                    }
                ]
            }
        ]
    });

    if (!transaction) {
        throw new AppError('Transaction not found', 404);
    }

    res.json({
        success: true,
        data: { transaction }
    });
});

/**
 * @desc Create new transaction (transfer)
 * @route POST /api/transactions/transfer
 * @access Private
 */
const createTransfer = asyncHandler(async (req, res, next) => {
    const {
        from_account_id,
        to_account_number,
        amount,
        description = '',
        transfer_type = 'internal'
    } = req.body;
    const userId = req.user.id;

    logger.info(`Transfer request: ${amount} from account ${from_account_id} to ${to_account_number}`);

    // Start transaction
    const t = await sequelize.transaction();

    try {
        // Validate amount
        const transferAmount = parseFloat(amount);
        if (transferAmount <= 0) {
            throw new AppError('Transfer amount must be greater than 0', 400);
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

        // Check sufficient balance
        if (fromAccount.balance < transferAmount) {
            throw new AppError('Insufficient balance', 400);
        }

        // Get destination account
        const toAccount = await Account.findOne({
            where: {
                account_number: to_account_number,
                is_active: true
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ],
            transaction: t
        });

        if (!toAccount) {
            throw new AppError('Destination account not found', 404);
        }

        // Check if it's a self-transfer
        if (fromAccount.id === toAccount.id) {
            throw new AppError('Cannot transfer to the same account', 400);
        }

        // Determine transaction type
        let transactionType = 'transfer';
        if (fromAccount.user_id === toAccount.user_id) {
            transactionType = 'internal_transfer';
        } else {
            transactionType = 'external_transfer';
        }

        // Create transaction record
        const transaction = await Transaction.create({
            from_account_id: fromAccount.id,
            to_account_id: toAccount.id,
            amount: transferAmount,
            transaction_type: transactionType,
            description,
            status: 'pending',
            reference_number: Transaction.generateReferenceNumber()
        }, { transaction: t });

        // Update account balances
        await fromAccount.update({
            balance: fromAccount.balance - transferAmount
        }, { transaction: t });

        await toAccount.update({
            balance: toAccount.balance + transferAmount
        }, { transaction: t });

        // Update transaction status to completed
        await transaction.update({
            status: 'completed',
            processed_at: new Date()
        }, { transaction: t });

        // Commit transaction
        await t.commit();

        logger.info(`Transfer completed: ${transaction.id}`);

        // Emit real-time updates
        emitBalanceUpdate(fromAccount.id, fromAccount.balance - transferAmount);
        emitBalanceUpdate(toAccount.id, toAccount.balance + transferAmount);
        emitNewTransaction(fromAccount.user_id, transaction);
        if (fromAccount.user_id !== toAccount.user_id) {
            emitNewTransaction(toAccount.User.id, transaction);
        }

        // Get the complete transaction data
        const completeTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                {
                    model: Account,
                    as: 'fromAccount',
                    attributes: ['id', 'account_number', 'account_type']
                },
                {
                    model: Account,
                    as: 'toAccount',
                    attributes: ['id', 'account_number', 'account_type']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Transfer completed successfully',
            data: { transaction: completeTransaction }
        });

    } catch (error) {
        await t.rollback();
        throw error;
    }
});

/**
 * @desc Create deposit transaction
 * @route POST /api/transactions/deposit
 * @access Private
 */
const createDeposit = asyncHandler(async (req, res, next) => {
    const { account_id, amount, description = '' } = req.body;
    const userId = req.user.id;

    logger.info(`Deposit request: ${amount} to account ${account_id}`);

    // Start transaction
    const t = await sequelize.transaction();

    try {
        // Validate amount
        const depositAmount = parseFloat(amount);
        if (depositAmount <= 0) {
            throw new AppError('Deposit amount must be greater than 0', 400);
        }

        // Get account and verify ownership
        const account = await Account.findOne({
            where: {
                id: account_id,
                user_id: userId,
                is_active: true
            },
            transaction: t
        });

        if (!account) {
            throw new AppError('Account not found', 404);
        }

        // Create transaction record
        const transaction = await Transaction.create({
            to_account_id: account.id,
            amount: depositAmount,
            transaction_type: 'deposit',
            description,
            status: 'pending',
            reference_number: Transaction.generateReferenceNumber()
        }, { transaction: t });

        // Update account balance
        await account.update({
            balance: account.balance + depositAmount
        }, { transaction: t });

        // Update transaction status to completed
        await transaction.update({
            status: 'completed',
            processed_at: new Date()
        }, { transaction: t });

        // Commit transaction
        await t.commit();

        logger.info(`Deposit completed: ${transaction.id}`);

        // Emit real-time updates
        emitBalanceUpdate(account.id, account.balance + depositAmount);
        emitNewTransaction(userId, transaction);

        res.status(201).json({
            success: true,
            message: 'Deposit completed successfully',
            data: { transaction }
        });

    } catch (error) {
        await t.rollback();
        throw error;
    }
});

/**
 * @desc Create withdrawal transaction
 * @route POST /api/transactions/withdrawal
 * @access Private
 */
const createWithdrawal = asyncHandler(async (req, res, next) => {
    const { account_id, amount, description = '' } = req.body;
    const userId = req.user.id;

    logger.info(`Withdrawal request: ${amount} from account ${account_id}`);

    // Start transaction
    const t = await sequelize.transaction();

    try {
        // Validate amount
        const withdrawalAmount = parseFloat(amount);
        if (withdrawalAmount <= 0) {
            throw new AppError('Withdrawal amount must be greater than 0', 400);
        }

        // Get account and verify ownership
        const account = await Account.findOne({
            where: {
                id: account_id,
                user_id: userId,
                is_active: true
            },
            transaction: t
        });

        if (!account) {
            throw new AppError('Account not found', 404);
        }

        // Check sufficient balance
        if (account.balance < withdrawalAmount) {
            throw new AppError('Insufficient balance', 400);
        }

        // Create transaction record
        const transaction = await Transaction.create({
            from_account_id: account.id,
            amount: withdrawalAmount,
            transaction_type: 'withdrawal',
            description,
            status: 'pending',
            reference_number: Transaction.generateReferenceNumber()
        }, { transaction: t });

        // Update account balance
        await account.update({
            balance: account.balance - withdrawalAmount
        }, { transaction: t });

        // Update transaction status to completed
        await transaction.update({
            status: 'completed',
            processed_at: new Date()
        }, { transaction: t });

        // Commit transaction
        await t.commit();

        logger.info(`Withdrawal completed: ${transaction.id}`);

        // Emit real-time updates
        emitBalanceUpdate(account.id, account.balance - withdrawalAmount);
        emitNewTransaction(userId, transaction);

        res.status(201).json({
            success: true,
            message: 'Withdrawal completed successfully',
            data: { transaction }
        });

    } catch (error) {
        await t.rollback();
        throw error;
    }
});

/**
 * @desc Get transaction summary
 * @route GET /api/transactions/summary
 * @access Private
 */
const getTransactionSummary = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

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
                total_transactions: 0,
                total_amount_sent: 0,
                total_amount_received: 0,
                transaction_breakdown: {},
                recent_transactions: []
            }
        });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get transaction summary
    const [sentTransactions, receivedTransactions, recentTransactions] = await Promise.all([
        // Sent transactions
        Transaction.findAll({
            where: {
                from_account_id: { [Op.in]: accountIds },
                status: 'completed',
                created_at: { [Op.gte]: startDate }
            },
            attributes: [
                'transaction_type',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
            ],
            group: ['transaction_type']
        }),

        // Received transactions
        Transaction.findAll({
            where: {
                to_account_id: { [Op.in]: accountIds },
                status: 'completed',
                created_at: { [Op.gte]: startDate }
            },
            attributes: [
                'transaction_type',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
            ],
            group: ['transaction_type']
        }),

        // Recent transactions (last 10)
        Transaction.findAll({
            where: {
                [Op.or]: [
                    { from_account_id: { [Op.in]: accountIds } },
                    { to_account_id: { [Op.in]: accountIds } }
                ],
                status: 'completed'
            },
            include: [
                {
                    model: Account,
                    as: 'fromAccount',
                    attributes: ['account_number']
                },
                {
                    model: Account,
                    as: 'toAccount',
                    attributes: ['account_number']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 10
        })
    ]);

    // Calculate totals
    let totalAmountSent = 0;
    let totalAmountReceived = 0;
    const transactionBreakdown = {};

    sentTransactions.forEach(tx => {
        totalAmountSent += parseFloat(tx.dataValues.total_amount);
        transactionBreakdown[tx.transaction_type] = {
            ...transactionBreakdown[tx.transaction_type],
            sent: {
                count: parseInt(tx.dataValues.count),
                amount: parseFloat(tx.dataValues.total_amount)
            }
        };
    });

    receivedTransactions.forEach(tx => {
        totalAmountReceived += parseFloat(tx.dataValues.total_amount);
        transactionBreakdown[tx.transaction_type] = {
            ...transactionBreakdown[tx.transaction_type],
            received: {
                count: parseInt(tx.dataValues.count),
                amount: parseFloat(tx.dataValues.total_amount)
            }
        };
    });

    const totalTransactions = sentTransactions.length + receivedTransactions.length;

    res.json({
        success: true,
        data: {
            period_days: parseInt(period),
            total_transactions: totalTransactions,
            total_amount_sent: totalAmountSent,
            total_amount_received: totalAmountReceived,
            net_amount: totalAmountReceived - totalAmountSent,
            transaction_breakdown: transactionBreakdown,
            recent_transactions: recentTransactions
        }
    });
});

/**
 * @desc Cancel pending transaction
 * @route PUT /api/transactions/:id/cancel
 * @access Private
 */
const cancelTransaction = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    logger.info(`Transaction cancellation request: ${id}`);

    // Get user's account IDs
    const userAccounts = await Account.findAll({
        where: { user_id: userId },
        attributes: ['id']
    });

    const accountIds = userAccounts.map(acc => acc.id);

    const transaction = await Transaction.findOne({
        where: {
            id,
            from_account_id: { [Op.in]: accountIds },
            status: 'pending'
        }
    });

    if (!transaction) {
        throw new AppError('Pending transaction not found', 404);
    }

    // Update transaction status
    await transaction.update({
        status: 'cancelled',
        processed_at: new Date()
    });

    logger.info(`Transaction cancelled: ${id}`);

    // Emit update
    emitTransactionUpdate(id, 'cancelled');

    res.json({
        success: true,
        message: 'Transaction cancelled successfully',
        data: { transaction }
    });
});

module.exports = {
    getTransactions,
    getTransaction,
    createTransfer,
    createDeposit,
    createWithdrawal,
    getTransactionSummary,
    cancelTransaction
};
