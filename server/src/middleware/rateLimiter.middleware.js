const rateLimit = require('express-rate-limit');
const { RATE_LIMITS, HTTP_STATUS } = require('../utils/constants');

/**
 * General rate limiter for all routes
 */
const generalLimiter = rateLimit({
    windowMs: RATE_LIMITS.GENERAL.windowMs,
    max: RATE_LIMITS.GENERAL.max,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(RATE_LIMITS.GENERAL.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: Math.ceil(RATE_LIMITS.GENERAL.windowMs / 1000)
        });
    }
});

/**
 * Strict rate limiter for authentication routes
 */
const authLimiter = rateLimit({
    windowMs: RATE_LIMITS.AUTH.windowMs,
    max: RATE_LIMITS.AUTH.max,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: Math.ceil(RATE_LIMITS.AUTH.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many login attempts from this IP, please try again later.',
            retryAfter: Math.ceil(RATE_LIMITS.AUTH.windowMs / 1000)
        });
    }
});

/**
 * Rate limiter for transaction routes
 */
const transactionLimiter = rateLimit({
    windowMs: RATE_LIMITS.TRANSACTION.windowMs,
    max: RATE_LIMITS.TRANSACTION.max,
    message: {
        success: false,
        message: 'Too many transactions attempted, please wait before trying again.',
        retryAfter: Math.ceil(RATE_LIMITS.TRANSACTION.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use user ID for authenticated users, IP for others
        return req.user ? `user_${req.user.id}` : req.ip;
    },
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Transaction limit reached, please wait before attempting another transaction.',
            retryAfter: Math.ceil(RATE_LIMITS.TRANSACTION.windowMs / 1000)
        });
    }
});

/**
 * Rate limiter for password reset requests
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use email for password reset requests
        return req.body.email || req.ip;
    },
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many password reset attempts for this email, please try again later.',
            retryAfter: 3600
        });
    }
});

/**
 * Rate limiter for account creation
 */
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registration attempts per hour per IP
    message: {
        success: false,
        message: 'Too many account creation attempts, please try again later.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many registration attempts from this IP, please try again later.',
            retryAfter: 3600
        });
    }
});

/**
 * Rate limiter for API endpoints requiring higher security
 */
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: {
        success: false,
        message: 'Rate limit exceeded for this endpoint, please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Rate limit exceeded for this endpoint, please try again later.',
            retryAfter: 900
        });
    }
});

/**
 * Custom rate limiter factory
 * @param {Object} options - Rate limit options
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (options = {}) => {
    const defaultOptions = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: {
            success: false,
            message: 'Too many requests, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false
    };

    return rateLimit({ ...defaultOptions, ...options });
};

module.exports = {
    generalLimiter,
    authLimiter,
    transactionLimiter,
    passwordResetLimiter,
    registrationLimiter,
    strictLimiter,
    createRateLimiter
};
