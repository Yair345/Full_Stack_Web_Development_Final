const { Account, Transaction, User } = require('../models');
const { AppError } = require('../utils/error.utils');
const { catchAsync } = require('../middleware/error.middleware');
const { requestLogger: logger } = require('../middleware/logger.middleware');
const { generateAccountNumber } = require('../utils/encryption.utils');
const { emitBalanceUpdate } = require('../websocket/socket');
const AuditService = require('../services/audit.service');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc Get all user accounts
 * @route GET /api/accounts
 * @access Private
 */
const getAccounts = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    logger.info(`Getting accounts for user: ${userId}`);

    const accounts = await Account.findAll({
        where: { user_id: userId },
        attributes: [
            'id',
            'account_number',
            'account_name', // This will map to the 'name' field in the database
            'account_type',
            'balance',
            'currency',
            'is_active',
            'overdraft_limit',
            'interest_rate',
            'monthly_fee',
            'minimum_balance',
            'created_at',
            'updated_at'
        ],
        order: [['created_at', 'DESC']]
    });

    logger.info(`Found ${accounts.length} accounts for user ${userId}:`, accounts.map(acc => ({
        id: acc.id,
        name: acc.account_name,
        type: acc.account_type,
        balance: acc.balance
    })));

    res.json({
        success: true,
        data: accounts // Return accounts directly instead of { accounts }
    });
});

/**
 * @desc Get account by ID
 * @route GET /api/accounts/:id
 * @access Private
 */
const getAccount = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await Account.findOne({
        where: {
            id,
            user_id: userId
        },
        attributes: [
            'id',
            'account_number',
            'account_type',
            'balance',
            'currency',
            'is_active',
            'created_at',
            'updated_at'
        ]
    });

    if (!account) {
        throw new AppError('Account not found', 404);
    }

    res.json({
        success: true,
        data: { account }
    });
});

/**
 * @desc Create new account
 * @route POST /api/accounts
 * @access Private
 */
const createAccount = catchAsync(async (req, res, next) => {
    const {
        account_type,
        currency = 'USD',
        account_name,
        initial_deposit = 0,
        overdraft_limit = 0
    } = req.body;
    const userId = req.user.id;

    logger.info(`Account creation request - Raw body: ${JSON.stringify(req.body)}`);
    logger.info(`Account creation request for user: ${userId}, type: ${account_type}, name: "${account_name}", initial_deposit: ${initial_deposit}, overdraft_limit: ${overdraft_limit}, currency: ${currency}`);

    // Validate required fields
    if (!account_name || account_name.trim().length < 2 || account_name.trim().length > 100) {
        throw new AppError('Account name must be between 2 and 100 characters', 400);
    }

    // Validate initial deposit
    const depositAmount = parseFloat(initial_deposit) || 0;
    if (depositAmount < 0) {
        throw new AppError('Initial deposit cannot be negative', 400);
    }

    // Validate overdraft limit
    const overdraftAmount = parseFloat(overdraft_limit) || 0;
    if (overdraftAmount < 0) {
        throw new AppError('Overdraft limit cannot be negative', 400);
    }

    // Validate account type
    const validAccountTypes = ['checking', 'savings', 'business'];
    if (!validAccountTypes.includes(account_type)) {
        throw new AppError('Invalid account type', 400);
    }

    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'ILS'];
    if (!validCurrencies.includes(currency)) {
        throw new AppError('Invalid currency', 400);
    }

    // Check account limits (e.g., max 5 accounts per user)
    const existingAccountsCount = await Account.count({
        where: { user_id: userId, is_active: true }
    });

    if (existingAccountsCount >= 5) {
        throw new AppError('Maximum number of accounts reached', 400);
    }

    // Check if user already has a checking account (only checking accounts are limited to one)
    if (account_type === 'checking') {
        const existingCheckingAccount = await Account.findOne({
            where: {
                user_id: userId,
                account_type: 'checking',
                is_active: true
            }
        });

        if (existingCheckingAccount) {
            throw new AppError('You can only have one checking account', 400);
        }
    }

    // Get existing checking account for deposit validation (for non-checking accounts)
    let checkingAccount = null;
    if (account_type !== 'checking' && depositAmount > 0) {
        checkingAccount = await Account.findOne({
            where: {
                user_id: userId,
                account_type: 'checking',
                is_active: true
            }
        });

        if (!checkingAccount) {
            throw new AppError('You must have a checking account to create other account types', 400);
        }

        // Check if checking account has sufficient funds for the deposit
        if (!checkingAccount.hasSufficientBalance(depositAmount)) {
            throw new AppError(`Insufficient funds in checking account. Available: ${checkingAccount.currency} ${checkingAccount.getAvailableBalance()}, Required: ${currency} ${depositAmount}`, 400);
        }
    }

    // Generate unique account number
    let accountNumber;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
        accountNumber = generateAccountNumber();
        const existing = await Account.findOne({
            where: { account_number: accountNumber }
        });
        if (!existing) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new AppError('Unable to generate unique account number', 500);
    }

    // Prepare account data
    const accountData = {
        user_id: userId,
        account_number: accountNumber,
        account_name: account_name.trim(), // This will map to the 'name' field in database via Sequelize
        account_type,
        balance: depositAmount, // Set initial deposit as balance
        currency,
        is_active: true,
        overdraft_limit: overdraftAmount,
        // Set account-type-specific defaults (interest rates as decimal: 0.025 = 2.5%)
        interest_rate: account_type === 'savings' ? 0.025 : (account_type === 'checking' ? 0.001 : 0),
        monthly_fee: account_type === 'business' ? 15.00 : 0,
        minimum_balance: account_type === 'savings' ? 500 : 0
    };

    logger.info(`Creating account with data: ${JSON.stringify(accountData)}`);

    // Use database transaction to ensure atomicity
    const result = await sequelize.transaction(async (t) => {
        // Create account with all parameters
        const account = await Account.create(accountData, { transaction: t });

        logger.info(`Account created with ID: ${account.id}, Name: "${account.account_name}"`);

        // Handle deposit transactions
        if (depositAmount > 0) {
            if (account_type === 'checking') {
                // For checking accounts, create initial deposit transaction
                const transaction = await Transaction.create({
                    transaction_ref: `DEP-${uuidv4()}`,
                    to_account_id: account.id,
                    transaction_type: 'deposit',
                    amount: depositAmount,
                    currency: currency,
                    status: 'completed',
                    description: 'Initial deposit for new checking account',
                    initiated_by: userId,
                    authorized_by: userId,
                    balance_before: 0,
                    balance_after: depositAmount,
                    completed_at: new Date()
                }, { transaction: t });

                logger.info(`Initial deposit transaction created for checking account: ${account.id}, amount: ${depositAmount}, transaction ID: ${transaction.id}`);
            } else {
                // For non-checking accounts, transfer from checking account
                const withdrawalRef = `TRF-OUT-${uuidv4()}`;
                const depositRef = `TRF-IN-${uuidv4()}`;
                
                // Deduct from checking account
                const checkingBalanceBefore = parseFloat(checkingAccount.balance);
                const checkingBalanceAfter = checkingBalanceBefore - depositAmount;
                
                await checkingAccount.update({ balance: checkingBalanceAfter }, { transaction: t });

                // Create withdrawal transaction for checking account
                const withdrawalTransaction = await Transaction.create({
                    transaction_ref: withdrawalRef,
                    from_account_id: checkingAccount.id,
                    to_account_id: account.id,
                    transaction_type: 'transfer',
                    amount: depositAmount,
                    currency: currency,
                    status: 'completed',
                    description: `Transfer to new ${account_type} account: ${account.account_name}`,
                    initiated_by: userId,
                    authorized_by: userId,
                    balance_before: checkingBalanceBefore,
                    balance_after: checkingBalanceAfter,
                    completed_at: new Date()
                }, { transaction: t });

                // Create deposit transaction for new account
                const depositTransaction = await Transaction.create({
                    transaction_ref: depositRef,
                    from_account_id: checkingAccount.id,
                    to_account_id: account.id,
                    transaction_type: 'transfer',
                    amount: depositAmount,
                    currency: currency,
                    status: 'completed',
                    description: `Initial deposit from checking account: ${checkingAccount.account_name}`,
                    initiated_by: userId,
                    authorized_by: userId,
                    balance_before: 0,
                    balance_after: depositAmount,
                    completed_at: new Date()
                }, { transaction: t });

                logger.info(`Transfer transactions created - From checking (${checkingAccount.id}): ${withdrawalTransaction.id}, To new account (${account.id}): ${depositTransaction.id}`);
            }
        }

        return account;
    });

    // Account creation completed successfully - emit WebSocket updates outside transaction
    const account = result;
    
    // Emit balance updates after transaction is committed
    if (depositAmount > 0 && account_type !== 'checking' && checkingAccount) {
        const checkingBalanceAfter = parseFloat(checkingAccount.balance) - depositAmount;
        emitBalanceUpdate(checkingAccount.id, checkingBalanceAfter);
        emitBalanceUpdate(account.id, depositAmount);
    }

    logger.info(`Account created successfully: ${account.id} with name: "${account.account_name}", balance: ${account.balance}, overdraft: ${account.overdraft_limit}, currency: ${account.currency}`);

    // Log account creation to SystemLog (system-level operation)
    await AuditService.logSystem({
        level: 'info',
        message: `New bank account created: ${account.account_number} for user ${userId}`,
        service: 'account_management',
        meta: {
            accountId: account.id,
            accountNumber: account.account_number,
            accountName: account.account_name,
            accountType: account.account_type,
            initialBalance: account.balance,
            currency: account.currency,
            userId: userId,
            overdraftLimit: account.overdraft_limit,
            features: {
                interestRate: account.interest_rate,
                monthlyFee: account.monthly_fee,
                minimumBalance: account.minimum_balance
            }
        }
    });

    // Log account creation audit event to MongoDB
    await AuditService.logAccount({
        action: 'created',
        req,
        account,
        details: {
            accountName: account.account_name,
            initialDeposit: depositAmount,
            overdraftLimit: account.overdraft_limit,
            accountFeatures: {
                interestRate: account.interest_rate,
                monthlyFee: account.monthly_fee,
                minimumBalance: account.minimum_balance
            }
        }
    });

    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
            account: {
                id: account.id,
                account_number: account.account_number,
                name: account.account_name,
                account_type: account.account_type,
                balance: account.balance,
                currency: account.currency,
                is_active: account.is_active,
                overdraft_limit: account.overdraft_limit,
                interest_rate: account.interest_rate,
                monthly_fee: account.monthly_fee,
                minimum_balance: account.minimum_balance,
                created_at: account.created_at
            }
        }
    });
});

/**
 * @desc Update account
 * @route PUT /api/accounts/:id
 * @access Private
 */
const updateAccount = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { account_type } = req.body;
    const userId = req.user.id;

    logger.info(`Account update request for account: ${id}`);

    // Find account
    const account = await Account.findOne({
        where: {
            id,
            user_id: userId
        }
    });

    if (!account) {
        throw new AppError('Account not found', 404);
    }

    // Update allowed fields
    const updateData = {};
    if (account_type && account_type !== account.account_type) {
        const validAccountTypes = ['checking', 'savings', 'business'];
        if (!validAccountTypes.includes(account_type)) {
            throw new AppError('Invalid account type', 400);
        }
        updateData.account_type = account_type;
    }

    if (Object.keys(updateData).length === 0) {
        throw new AppError('No valid fields to update', 400);
    }

    const updatedAccount = await account.update(updateData);

    logger.info(`Account updated successfully: ${id}`);

    // Log account update audit event to MongoDB
    await AuditService.logAccount({
        action: 'updated',
        req,
        account: updatedAccount,
        details: {
            updatedFields: updateData,
            previousAccountType: account.account_type,
            newAccountType: updatedAccount.account_type
        }
    });

    res.json({
        success: true,
        message: 'Account updated successfully',
        data: {
            account: {
                id: updatedAccount.id,
                account_number: updatedAccount.account_number,
                account_type: updatedAccount.account_type,
                balance: updatedAccount.balance,
                currency: updatedAccount.currency,
                is_active: updatedAccount.is_active,
                updated_at: updatedAccount.updated_at
            }
        }
    });
});

/**
 * @desc Soft delete account (update deleted_at column)
 * @route DELETE /api/accounts/:id
 * @access Private
 */
const deleteAccount = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    logger.info(`Account soft delete request for account: ${id}`);

    // Find account
    const account = await Account.findOne({
        where: {
            id,
            user_id: userId
        }
    });

    if (!account) {
        throw new AppError('Account not found', 404);
    }

    if (!account.is_active) {
        throw new AppError('Account is already inactive', 400);
    }

    // Check if account has balance
    if (account.balance > 0) {
        throw new AppError('Cannot delete account with positive balance. Please transfer funds first.', 400);
    }

    // Check for pending transactions
    const pendingTransactions = await Transaction.count({
        where: {
            [Op.or]: [
                { from_account_id: id },
                { to_account_id: id }
            ],
            status: 'pending'
        }
    });

    if (pendingTransactions > 0) {
        throw new AppError('Cannot delete account with pending transactions', 400);
    }

    // Use soft delete (paranoid: true sets deleted_at timestamp)
    await account.destroy();

    logger.info(`Account soft deleted successfully: ${id}`);

    // Log account deletion audit event to MongoDB
    await AuditService.logAccount({
        action: 'deleted',
        req,
        account,
        details: {
            reason: 'user_requested',
            finalBalance: account.balance,
            pendingTransactionsChecked: true,
            deletionType: 'soft_delete'
        }
    });

    res.json({
        success: true,
        message: 'Account deleted successfully'
    });
});

/**
 * @desc Deactivate account
 * @route PUT /api/accounts/:id/deactivate
 * @access Private
 */
const deactivateAccount = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    logger.info(`Account deactivation request for account: ${id}`);

    // Find account
    const account = await Account.findOne({
        where: {
            id,
            user_id: userId
        }
    });

    if (!account) {
        throw new AppError('Account not found', 404);
    }

    if (!account.is_active) {
        throw new AppError('Account is already deactivated', 400);
    }

    // Check if account has balance
    if (account.balance > 0) {
        throw new AppError('Cannot deactivate account with positive balance', 400);
    }

    // Check for pending transactions
    const pendingTransactions = await Transaction.count({
        where: {
            [Op.or]: [
                { from_account_id: id },
                { to_account_id: id }
            ],
            status: 'pending'
        }
    });

    if (pendingTransactions > 0) {
        throw new AppError('Cannot deactivate account with pending transactions', 400);
    }

    // Deactivate account
    await account.update({ is_active: false });

    logger.info(`Account deactivated successfully: ${id}`);

    // Log account deactivation audit event to MongoDB
    await AuditService.logAccount({
        action: 'deactivated',
        req,
        account,
        details: {
            reason: 'user_requested',
            finalBalance: account.balance,
            pendingTransactionsChecked: true
        }
    });

    res.json({
        success: true,
        message: 'Account deactivated successfully'
    });
});

/**
 * @desc Get account balance
 * @route GET /api/accounts/:id/balance
 * @access Private
 */
const getBalance = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await Account.findOne({
        where: {
            id,
            user_id: userId,
            is_active: true
        },
        attributes: ['id', 'account_number', 'balance', 'currency']
    });

    if (!account) {
        throw new AppError('Account not found', 404);
    }

    res.json({
        success: true,
        data: {
            account_id: account.id,
            account_number: account.account_number,
            balance: account.balance,
            currency: account.currency,
            formatted_balance: account.getFormattedBalance()
        }
    });
});

/**
 * @desc Get account transactions
 * @route GET /api/accounts/:id/transactions
 * @access Private
 */
const getAccountTransactions = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const {
        page = 1,
        limit = 20,
        type,
        status,
        start_date,
        end_date
    } = req.query;

    // Verify account ownership
    const account = await Account.findOne({
        where: {
            id,
            user_id: userId
        }
    });

    if (!account) {
        throw new AppError('Account not found', 404);
    }

    // Build where clause
    const whereClause = {
        [Op.or]: [
            { from_account_id: id },
            { to_account_id: id }
        ]
    };

    if (type) {
        whereClause.transaction_type = type;
    }

    if (status) {
        whereClause.status = status;
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
 * @desc Get account statement
 * @route GET /api/accounts/:id/statement
 * @access Private
 */
const getAccountStatement = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { start_date, end_date } = req.query;

    // Verify account ownership
    const account = await Account.findOne({
        where: {
            id,
            user_id: userId
        },
        include: [
            {
                model: User,
                attributes: ['username', 'email']
            }
        ]
    });

    if (!account) {
        throw new AppError('Account not found', 404);
    }

    // Set default date range (last 30 days if not provided)
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get transactions for the period
    const transactions = await Transaction.findAll({
        where: {
            [Op.or]: [
                { from_account_id: id },
                { to_account_id: id }
            ],
            created_at: {
                [Op.between]: [startDate, endDate]
            },
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
        order: [['created_at', 'ASC']]
    });

    // Calculate summary
    let totalDebits = 0;
    let totalCredits = 0;

    transactions.forEach(transaction => {
        if (transaction.from_account_id === parseInt(id)) {
            totalDebits += parseFloat(transaction.amount);
        } else {
            totalCredits += parseFloat(transaction.amount);
        }
    });

    res.json({
        success: true,
        data: {
            account: {
                id: account.id,
                account_number: account.account_number,
                account_type: account.account_type,
                current_balance: account.balance,
                currency: account.currency
            },
            statement_period: {
                start_date: startDate,
                end_date: endDate
            },
            summary: {
                total_transactions: transactions.length,
                total_debits: totalDebits,
                total_credits: totalCredits,
                net_change: totalCredits - totalDebits
            },
            transactions
        }
    });
});

/**
 * @desc Check if user has checking account
 * @route GET /api/accounts/check-existing
 * @access Private
 */
const checkExistingAccounts = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    logger.info(`Checking existing accounts for user: ${userId}`);

    // Check for existing checking account
    const hasCheckingAccount = await Account.findOne({
        where: {
            user_id: userId,
            account_type: 'checking',
            is_active: true
        },
        attributes: ['id'] // Only need to know if it exists
    });

    res.json({
        success: true,
        data: {
            hasCheckingAccount: !!hasCheckingAccount
        }
    });
});

module.exports = {
    getAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    deactivateAccount,
    getBalance,
    getAccountTransactions,
    getAccountStatement,
    checkExistingAccounts
};
