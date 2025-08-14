const { USER_ROLES, ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');

/**
 * Check if user has required role
 * @param {Array|String} allowedRoles - Array of allowed roles or single role
 * @returns {Function} Middleware function
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const { user } = req;

            if (!user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: ERROR_MESSAGES.UNAUTHORIZED
                });
            }

            // Convert single role to array
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            if (!roles.includes(user.role)) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: ERROR_MESSAGES.FORBIDDEN
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error.message);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: ERROR_MESSAGES.INTERNAL_ERROR
            });
        }
    };
};

/**
 * Check if user is admin
 */
const requireAdmin = requireRole(USER_ROLES.ADMIN);

/**
 * Check if user is manager or admin
 */
const requireManager = requireRole([USER_ROLES.MANAGER, USER_ROLES.ADMIN]);

/**
 * Check if user is customer (basic user)
 */
const requireCustomer = requireRole(USER_ROLES.CUSTOMER);

/**
 * Check if user has admin or manager role
 */
const requireAdminOrManager = requireRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]);

/**
 * Check if user can access user management features
 */
const canManageUsers = (req, res, next) => {
    try {
        const { user } = req;
        const targetUserId = req.params.id || req.params.userId;

        // Admins can manage all users
        if (user.role === USER_ROLES.ADMIN) {
            return next();
        }

        // Managers can manage customers but not other managers or admins
        if (user.role === USER_ROLES.MANAGER) {
            // Additional check would be needed here to verify target user's role
            // For now, allow managers to proceed
            return next();
        }

        // Customers can only manage their own profile
        if (user.role === USER_ROLES.CUSTOMER) {
            if (targetUserId && targetUserId.toString() === user.id.toString()) {
                return next();
            }
        }

        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: ERROR_MESSAGES.FORBIDDEN
        });

    } catch (error) {
        console.error('User management access check error:', error.message);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR
        });
    }
};

/**
 * Check if user can access account
 */
const canAccessAccount = async (req, res, next) => {
    try {
        const { user } = req;
        const accountId = req.params.id || req.params.accountId;

        // Admins and managers can access all accounts
        if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.MANAGER) {
            return next();
        }

        // For customers, check if they own the account
        // This would require database lookup - implementing basic version
        const { Account } = require('../models');

        const account = await Account.findOne({
            where: {
                id: accountId,
                user_id: user.id
            }
        });

        if (!account) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Account not found or access denied'
            });
        }

        // Attach account to request for use in controller
        req.account = account;
        next();

    } catch (error) {
        console.error('Account access check error:', error.message);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR
        });
    }
};

/**
 * Check if user can access transaction
 */
const canAccessTransaction = async (req, res, next) => {
    try {
        const { user } = req;
        const transactionId = req.params.id || req.params.transactionId;

        // Admins and managers can access all transactions
        if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.MANAGER) {
            return next();
        }

        // For customers, check if they are involved in the transaction
        const { Transaction, Account } = require('../models');

        const transaction = await Transaction.findOne({
            where: { id: transactionId },
            include: [
                {
                    model: Account,
                    as: 'fromAccount',
                    where: { user_id: user.id },
                    required: false
                },
                {
                    model: Account,
                    as: 'toAccount',
                    where: { user_id: user.id },
                    required: false
                }
            ]
        });

        if (!transaction || (!transaction.fromAccount && !transaction.toAccount)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Transaction not found or access denied'
            });
        }

        req.transaction = transaction;
        next();

    } catch (error) {
        console.error('Transaction access check error:', error.message);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR
        });
    }
};

/**
 * Check if user has permission for financial operations
 */
const requireFinancialPermission = (req, res, next) => {
    try {
        const { user } = req;

        // Only verified users can perform financial operations
        if (!user.is_verified) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Account verification required for financial operations'
            });
        }

        next();
    } catch (error) {
        console.error('Financial permission check error:', error.message);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR
        });
    }
};

module.exports = {
    requireRole,
    requireAdmin,
    requireManager,
    requireCustomer,
    requireAdminOrManager,
    canManageUsers,
    canAccessAccount,
    canAccessTransaction,
    requireFinancialPermission
};
