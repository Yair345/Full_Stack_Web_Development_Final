const { AppError } = require('../utils/error.utils');
const { requestLogger: logger } = require('./logger.middleware');

/**
 * Middleware to check if user is approved by branch manager
 * Users with pending or rejected status cannot access protected resources
 */
const requireApproval = (req, res, next) => {
    const user = req.user;

    if (!user) {
        return next(new AppError('Authentication required', 401));
    }

    // Allow admins and managers to bypass approval check
    if (user.role === 'admin' || user.role === 'manager') {
        return next();
    }

    // Check approval status for regular users
    if (user.approval_status === 'pending') {
        logger.warn(`User ${user.id} attempted to access protected resource while pending approval`);
        return res.status(403).json({
            success: false,
            message: 'Your account is pending approval by the branch manager.',
            data: {
                approval_status: user.approval_status,
                pending_branch_id: user.pending_branch_id,
                requiresApproval: true
            }
        });
    }

    if (user.approval_status === 'rejected') {
        logger.warn(`User ${user.id} attempted to access protected resource after rejection`);
        return res.status(403).json({
            success: false,
            message: 'Your account has been rejected by the branch manager.',
            data: {
                approval_status: user.approval_status,
                rejection_reason: user.rejection_reason,
                requiresApproval: true
            }
        });
    }

    if (user.approval_status !== 'approved') {
        logger.warn(`User ${user.id} has unknown approval status: ${user.approval_status}`);
        return res.status(403).json({
            success: false,
            message: 'Your account status is unclear. Please contact support.',
            data: {
                approval_status: user.approval_status,
                requiresApproval: true
            }
        });
    }

    // User is approved, continue
    next();
};

/**
 * Middleware to allow only pending users (for waiting page access)
 */
const requirePendingStatus = (req, res, next) => {
    const user = req.user;

    if (!user) {
        return next(new AppError('Authentication required', 401));
    }

    // Allow only pending users to access waiting page resources
    if (user.approval_status !== 'pending') {
        return res.status(403).json({
            success: false,
            message: 'This resource is only available for users with pending approval status.',
            data: {
                approval_status: user.approval_status,
                should_redirect: true
            }
        });
    }

    next();
};

module.exports = {
    requireApproval,
    requirePendingStatus
};
