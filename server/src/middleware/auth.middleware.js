const { verifyAccessToken, verifyRefreshToken, extractTokenFromHeader } = require('../utils/jwt.utils');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const { User } = require('../models');

/**
 * Authenticate user using JWT token
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.TOKEN_INVALID
            });
        }

        // Verify the token
        const decoded = verifyAccessToken(token);

        // Get user from database
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        if (!user.is_active) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.USER_INACTIVE
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error:', error.message);

        if (error.message.includes('expired')) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.TOKEN_EXPIRED
            });
        }

        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.TOKEN_INVALID
        });
    }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = verifyAccessToken(token);
        const user = await User.findByPk(decoded.id);

        req.user = user && user.is_active ? user : null;
        next();

    } catch (error) {
        // If authentication fails, continue without user
        req.user = null;
        next();
    }
};

/**
 * Check if user owns the resource or is admin/manager
 */
const checkResourceOwnership = (resourceField = 'user_id') => {
    return async (req, res, next) => {
        try {
            const { user } = req;
            const resourceId = req.params.id;

            // Admins and managers can access any resource
            if (user.role === 'admin' || user.role === 'manager') {
                return next();
            }

            // For customers, check if they own the resource
            // This would typically involve checking the database
            // For now, we'll implement a basic check
            if (req.body[resourceField] && req.body[resourceField] !== user.id) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: ERROR_MESSAGES.FORBIDDEN
                });
            }

            next();
        } catch (error) {
            console.error('Resource ownership check error:', error.message);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: ERROR_MESSAGES.INTERNAL_ERROR
            });
        }
    };
};

/**
 * Refresh token validation
 */
const validateRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Get user from database
        const user = await User.findByPk(decoded.id);

        if (!user || !user.is_active) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Refresh token validation error:', error.message);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.TOKEN_INVALID
        });
    }
};

module.exports = {
    authenticate,
    optionalAuth,
    checkResourceOwnership,
    validateRefreshToken
};
