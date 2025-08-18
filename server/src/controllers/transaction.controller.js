const { Transaction, Account, User } = require('../models');
const AuditService = require('../services/audit.service');
const { AppError } = require('../utils/error.utils');
const { catchAsync } = require('../middleware/error.middleware');
const { generateTransactionRef } = require('../utils/encryption.utils');
const { emitBalanceUpdate, emitNewTransaction, emitTransactionUpdate } = require('../websocket/socket');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../utils/constants');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @desc Get all transactions for user
 * @route GET /api/transactions
 * @access Private
 */
const getTransactions = catchAsync(async (req, res, next) => {
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
                attributes: ['id', 'account_number', 'account_type', 'name', 'balance'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'first_name', 'last_name']
                    }
                ]
            },
            {
                model: Account,
                as: 'toAccount',
                attributes: ['id', 'account_number', 'account_type', 'name', 'balance'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'first_name', 'last_name']
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
const getTransaction = catchAsync(async (req, res, next) => {
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
                attributes: ['id', 'account_number', 'account_type', 'name', 'balance'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'first_name', 'last_name']
                    }
                ]
            },
            {
                model: Account,
                as: 'toAccount',
                attributes: ['id', 'account_number', 'account_type', 'name', 'balance'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'first_name', 'last_name']
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
const createTransfer = catchAsync(async (req, res, next) => {
    const {
        from_account_id,
        to_account_number,
        amount,
        description = '',
        transfer_type = 'internal'
    } = req.body;
    const userId = req.user.id;

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
                    as: 'user',
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

        // Determine transaction type - for transfers, always use 'transfer'
        const transactionType = TRANSACTION_TYPES.TRANSFER;

        // Create transaction record
        const transaction = await Transaction.create({
            transaction_ref: generateTransactionRef(),
            from_account_id: fromAccount.id,
            to_account_id: toAccount.id,
            amount: transferAmount,
            transaction_type: transactionType,
            description,
            status: TRANSACTION_STATUS.PENDING
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
            status: TRANSACTION_STATUS.COMPLETED,
            processed_at: new Date()
        }, { transaction: t });

        // Commit transaction
        await t.commit();

        // Get the complete transaction data
        const completeTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                {
                    model: Account,
                    as: 'fromAccount',
                    attributes: ['id', 'account_number', 'account_type', 'name', 'balance']
                },
                {
                    model: Account,
                    as: 'toAccount',
                    attributes: ['id', 'account_number', 'account_type', 'name', 'balance']
                }
            ]
        });

        // Log and emit events after successful commit (don't let these fail the transaction)
        try {
            // Log money transfer to SystemLog (system-level financial operation)
            await AuditService.logSystem({
                level: 'info',
                message: `💸 Money transfer completed: ${transferAmount} ${transaction.currency} from account ${fromAccount.account_number} to account ${toAccount.account_number}`,
                service: 'financial_transfers',
                meta: {
                    transactionId: transaction.id,
                    transactionRef: transaction.transaction_ref,
                    amount: transferAmount,
                    currency: transaction.currency,
                    fromAccount: {
                        id: fromAccount.id,
                        accountNumber: fromAccount.account_number,
                        previousBalance: fromAccount.balance,
                        newBalance: fromAccount.balance - transferAmount,
                        userId: fromAccount.user_id
                    },
                    toAccount: {
                        id: toAccount.id,
                        accountNumber: toAccount.account_number,
                        previousBalance: toAccount.balance,
                        newBalance: toAccount.balance + transferAmount,
                        userId: toAccount.user_id
                    },
                    transferType: transactionType,
                    description: description,
                    processingTime: Date.now() - transaction.created_at.getTime(),
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent')
                }
            });

            // Also log user action to SystemLog
            await AuditService.logSystem({
                level: 'info',
                message: `✅ Transfer completed successfully: $${transferAmount} from ${fromAccount.name} to ${toAccount.name}`,
                service: 'financial_transactions',
                meta: {
                    action: 'transfer_completed',
                    userId: req.user.id,
                    transactionId: transaction.id,
                    transactionRef: transaction.transaction_ref,
                    fromAccountNumber: fromAccount.account_number,
                    toAccountNumber: toAccount.account_number,
                    transferType: transactionType,
                    description
                }
            });

            // Emit real-time updates
            emitBalanceUpdate(fromAccount.id, fromAccount.balance - transferAmount);
            emitBalanceUpdate(toAccount.id, toAccount.balance + transferAmount);
            emitNewTransaction(fromAccount.user_id, transaction);
            if (fromAccount.user_id !== toAccount.user_id) {
                emitNewTransaction(toAccount.user.id, transaction);
            }
        } catch (loggingError) {
            // Log the error but don't fail the transaction since it's already committed
            console.error('Error in post-transaction logging:', loggingError);
        }

        res.status(201).json({
            success: true,
            message: `🎉 Transfer completed successfully! $${transferAmount} has been transferred from ${fromAccount.name} to ${toAccount.name}.`,
            data: { 
                transaction: completeTransaction,
                summary: {
                    amount: transferAmount,
                    currency: transaction.currency,
                    reference: transaction.transaction_ref,
                    fromAccount: {
                        name: fromAccount.name,
                        accountNumber: fromAccount.account_number,
                        newBalance: fromAccount.balance - transferAmount
                    },
                    toAccount: {
                        name: toAccount.name,
                        accountNumber: toAccount.account_number,
                        newBalance: toAccount.balance + transferAmount
                    },
                    completedAt: new Date()
                }
            }
        });

    } catch (error) {
        // Only rollback if transaction hasn't been committed yet
        if (!t.finished) {
            await t.rollback();
        }
        throw error;
    }
});

/**
 * @desc Create deposit transaction
 * @route POST /api/transactions/deposit
 * @access Private
 */
const createDeposit = catchAsync(async (req, res, next) => {
    const { account_id, amount, description = '' } = req.body;
    const userId = req.user.id;

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
            transaction_ref: generateTransactionRef(),
            to_account_id: account.id,
            amount: depositAmount,
            transaction_type: TRANSACTION_TYPES.DEPOSIT,
            description,
            status: TRANSACTION_STATUS.PENDING
        }, { transaction: t });

        // Update account balance
        await account.update({
            balance: account.balance + depositAmount
        }, { transaction: t });

        // Update transaction status to completed
        await transaction.update({
            status: TRANSACTION_STATUS.COMPLETED,
            processed_at: new Date()
        }, { transaction: t });

        // Commit transaction
        await t.commit();

        // Log successful deposit
        console.log(`💰 Deposit completed successfully!`);
        console.log(`   Transaction ID: ${transaction.id}`);
        console.log(`   Reference: ${transaction.transaction_ref}`);
        console.log(`   Amount: $${depositAmount}`);
        console.log(`   Account: ${account.name} (${account.account_number})`);
        console.log(`   New Balance: $${account.balance + depositAmount}`);

        // Log and emit events after successful commit (don't let these fail the transaction)
        try {
            // Log deposit to SystemLog (system-level financial operation)
            await AuditService.logSystem({
                level: 'info',
                message: `Deposit transaction completed: ${depositAmount} ${transaction.currency} to account ${account.account_number}`,
                service: 'financial_deposits',
                meta: {
                    transactionId: transaction.id,
                    transactionRef: transaction.transaction_ref,
                    amount: depositAmount,
                    currency: transaction.currency,
                    account: {
                        id: account.id,
                        accountNumber: account.account_number,
                        previousBalance: account.balance,
                        newBalance: account.balance + depositAmount,
                        userId: userId
                    },
                    description: description,
                    processingTime: Date.now() - transaction.created_at.getTime(),
                    ipAddress: req.ip || req.connection.remoteAddress
                }
            });

            // Log deposit to SystemLog
            await AuditService.logSystem({
                level: 'info',
                message: `💰 Deposit completed successfully: $${depositAmount} added to ${account.name}`,
                service: 'financial_transactions',
                meta: {
                    action: 'deposit_completed',
                    userId: req.user.id,
                    transactionId: transaction.id,
                    transactionRef: transaction.transaction_ref,
                    accountNumber: account.account_number,
                    previousBalance: account.balance,
                    newBalance: account.balance + depositAmount,
                    depositAmount: depositAmount
                }
            });

            // Emit real-time updates
            emitBalanceUpdate(account.id, account.balance + depositAmount);
            emitNewTransaction(userId, transaction);
        } catch (loggingError) {
            // Log the error but don't fail the transaction since it's already committed
            console.error('Error in post-transaction logging:', loggingError);
        }

        res.status(201).json({
            success: true,
            message: `💰 Deposit completed successfully! $${depositAmount} has been added to ${account.name}.`,
            data: { 
                transaction,
                summary: {
                    amount: depositAmount,
                    currency: transaction.currency,
                    reference: transaction.transaction_ref,
                    account: {
                        name: account.name,
                        accountNumber: account.account_number,
                        newBalance: account.balance + depositAmount
                    },
                    completedAt: new Date()
                }
            }
        });

    } catch (error) {
        // Only rollback if transaction hasn't been committed yet
        if (!t.finished) {
            await t.rollback();
        }
        throw error;
    }
});

/**
 * @desc Create withdrawal transaction
 * @route POST /api/transactions/withdrawal
 * @access Private
 */
const createWithdrawal = catchAsync(async (req, res, next) => {
    const { account_id, amount, description = '' } = req.body;
    const userId = req.user.id;

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
            transaction_ref: generateTransactionRef(),
            from_account_id: account.id,
            amount: withdrawalAmount,
            transaction_type: TRANSACTION_TYPES.WITHDRAWAL,
            description,
            status: TRANSACTION_STATUS.PENDING
        }, { transaction: t });

        // Update account balance
        await account.update({
            balance: account.balance - withdrawalAmount
        }, { transaction: t });

        // Update transaction status to completed
        await transaction.update({
            status: TRANSACTION_STATUS.COMPLETED,
            processed_at: new Date()
        }, { transaction: t });

        // Commit transaction
        await t.commit();

        // Log successful withdrawal
        console.log(`💸 Withdrawal completed successfully!`);
        console.log(`   Transaction ID: ${transaction.id}`);
        console.log(`   Reference: ${transaction.transaction_ref}`);
        console.log(`   Amount: $${withdrawalAmount}`);
        console.log(`   Account: ${account.name} (${account.account_number})`);
        console.log(`   New Balance: $${account.balance - withdrawalAmount}`);

        // Log and emit events after successful commit (don't let these fail the transaction)
        try {
            // Log withdrawal to SystemLog (system-level financial operation)
            await AuditService.logSystem({
                level: 'info',
                message: `Withdrawal transaction completed: ${withdrawalAmount} ${transaction.currency} from account ${account.account_number}`,
                service: 'financial_withdrawals',
                meta: {
                    transactionId: transaction.id,
                    transactionRef: transaction.transaction_ref,
                    amount: withdrawalAmount,
                    currency: transaction.currency,
                    account: {
                        id: account.id,
                        accountNumber: account.account_number,
                        previousBalance: account.balance,
                        newBalance: account.balance - withdrawalAmount,
                        userId: userId
                    },
                    description: description,
                    processingTime: Date.now() - transaction.created_at.getTime(),
                    ipAddress: req.ip || req.connection.remoteAddress
                }
            });

            // Log withdrawal to SystemLog
            await AuditService.logSystem({
                level: 'info',
                message: `💸 Withdrawal completed successfully: $${withdrawalAmount} withdrawn from ${account.name}`,
                service: 'financial_transactions',
                meta: {
                    action: 'withdrawal_completed',
                    userId: req.user.id,
                    transactionId: transaction.id,
                    transactionRef: transaction.transaction_ref,
                    accountNumber: account.account_number,
                    previousBalance: account.balance,
                    newBalance: account.balance - withdrawalAmount,
                    withdrawalAmount: withdrawalAmount
                }
            });

            // Emit real-time updates
            emitBalanceUpdate(account.id, account.balance - withdrawalAmount);
            emitNewTransaction(userId, transaction);
        } catch (loggingError) {
            // Log the error but don't fail the transaction since it's already committed
            console.error('Error in post-transaction logging:', loggingError);
        }

        res.status(201).json({
            success: true,
            message: `💸 Withdrawal completed successfully! $${withdrawalAmount} has been withdrawn from ${account.name}.`,
            data: { 
                transaction,
                summary: {
                    amount: withdrawalAmount,
                    currency: transaction.currency,
                    reference: transaction.transaction_ref,
                    account: {
                        name: account.name,
                        accountNumber: account.account_number,
                        newBalance: account.balance - withdrawalAmount
                    },
                    completedAt: new Date()
                }
            }
        });

    } catch (error) {
        // Only rollback if transaction hasn't been committed yet
        if (!t.finished) {
            await t.rollback();
        }
        throw error;
    }
});

/**
 * @desc Get transaction summary
 * @route GET /api/transactions/summary
 * @access Private
 */
const getTransactionSummary = catchAsync(async (req, res, next) => {
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
                status: TRANSACTION_STATUS.COMPLETED,
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
                status: TRANSACTION_STATUS.COMPLETED,
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
                status: TRANSACTION_STATUS.COMPLETED
            },
            include: [
                {
                    model: Account,
                    as: 'fromAccount',
                    attributes: ['account_number', 'name']
                },
                {
                    model: Account,
                    as: 'toAccount',
                    attributes: ['account_number', 'name']
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
const cancelTransaction = catchAsync(async (req, res, next) => {
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
            from_account_id: { [Op.in]: accountIds },
            status: TRANSACTION_STATUS.PENDING
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
