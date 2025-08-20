const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const winston = require('winston');
const AuditService = require('../services/audit.service');

// Configure Winston logger
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

/**
 * Custom error class for application errors
 */
class AppError extends Error {
    constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle async errors
 * @param {Function} fn - Async function
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Handle Sequelize validation errors
 * @param {Error} error - Sequelize error
 * @returns {AppError} Formatted error
 */
const handleSequelizeValidationError = (error) => {
    const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
    }));

    return new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        true
    );
};

/**
 * Handle Sequelize unique constraint errors
 * @param {Error} error - Sequelize error
 * @returns {AppError} Formatted error
 */
const handleSequelizeUniqueError = (error) => {
    const field = error.errors[0]?.path || 'field';
    return new AppError(
        `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        HTTP_STATUS.CONFLICT,
        true
    );
};

/**
 * Handle Sequelize foreign key constraint errors
 * @param {Error} error - Sequelize error
 * @returns {AppError} Formatted error
 */
const handleSequelizeForeignKeyError = (error) => {
    return new AppError(
        'Referenced resource does not exist',
        HTTP_STATUS.BAD_REQUEST,
        true
    );
};

/**
 * Handle JWT errors
 * @param {Error} error - JWT error
 * @returns {AppError} Formatted error
 */
const handleJWTError = (error) => {
    if (error.name === 'JsonWebTokenError') {
        return new AppError(
            ERROR_MESSAGES.TOKEN_INVALID,
            HTTP_STATUS.UNAUTHORIZED,
            true
        );
    }

    if (error.name === 'TokenExpiredError') {
        return new AppError(
            ERROR_MESSAGES.TOKEN_EXPIRED,
            HTTP_STATUS.UNAUTHORIZED,
            true
        );
    }

    return new AppError(
        ERROR_MESSAGES.TOKEN_INVALID,
        HTTP_STATUS.UNAUTHORIZED,
        true
    );
};

/**
 * Send error response for development
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

/**
 * Send error response for production
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR
        });
    }
};

/**
 * Global error handling middleware
 */
const globalErrorHandler = async (err, req, res, next) => {
    err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    err.status = err.status || 'error';

    // Log error to MongoDB system logs
    await AuditService.logSystem({
        level: 'error',
        message: `Error occurred: ${err.message}`,
        service: 'error_handling',
        meta: {
            errorName: err.name,
            errorMessage: err.message,
            errorStack: err.stack,
            url: req.originalUrl,
            method: req.method,
            statusCode: err.statusCode,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        }
    });

    // Also log error to file system (keeping existing functionality)
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
    });

    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'SequelizeValidationError') {
        error = handleSequelizeValidationError(err);
    } else if (err.name === 'SequelizeUniqueConstraintError') {
        error = handleSequelizeUniqueError(err);
    } else if (err.name === 'SequelizeForeignKeyConstraintError') {
        error = handleSequelizeForeignKeyError(err);
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        error = handleJWTError(err);
    } else if (err.code === 11000) {
        // MongoDB duplicate key error
        error = new AppError(
            'Duplicate field value entered',
            HTTP_STATUS.CONFLICT,
            true
        );
    }

    // Send appropriate error response
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else {
        sendErrorProd(error, res);
    }
};

/**
 * Handle 404 errors
 */
const notFoundHandler = (req, res, next) => {
    const err = new AppError(
        `Can't find ${req.originalUrl} on this server!`,
        HTTP_STATUS.NOT_FOUND
    );
    next(err);
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', async (err, promise) => {
    // Log to MongoDB system logs
    await AuditService.logSystem({
        level: 'critical',
        message: `Unhandled Promise Rejection: ${err.message}`,
        service: 'system_error',
        meta: {
            errorName: err.name,
            errorMessage: err.message,
            errorStack: err.stack,
            errorType: 'unhandled_rejection',
            promise: promise.toString(),
            timestamp: new Date().toISOString()
        }
    });

    // Keep original file logging
    logger.error('Unhandled Promise Rejection:', err);
    console.log('Unhandled Promise Rejection! 💥 Shutting down...');
    process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', async (err) => {
    // Log to MongoDB system logs
    await AuditService.logSystem({
        level: 'critical',
        message: `Uncaught Exception: ${err.message}`,
        service: 'system_error',
        meta: {
            errorName: err.name,
            errorMessage: err.message,
            errorStack: err.stack,
            errorType: 'uncaught_exception',
            timestamp: new Date().toISOString()
        }
    });

    // Keep original file logging
    logger.error('Uncaught Exception:', err);
    console.log('Uncaught Exception! 💥 Shutting down...');
    process.exit(1);
});

module.exports = {
    AppError,
    catchAsync,
    globalErrorHandler,
    notFoundHandler,
    logger
};
