const morgan = require('morgan');
const winston = require('winston');
const { getClientIP } = require('../utils/helpers');

// Configure Winston logger for requests
const requestLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/access.log' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    requestLogger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

/**
 * Morgan token for user ID
 */
morgan.token('user-id', (req) => {
    return req.user ? req.user.id : 'anonymous';
});

/**
 * Morgan token for request ID
 */
morgan.token('request-id', (req) => {
    return req.requestId || 'unknown';
});

/**
 * Morgan token for real IP
 */
morgan.token('real-ip', (req) => {
    return getClientIP(req);
});

/**
 * Custom Morgan format for detailed logging
 */
const morganFormat = ':real-ip - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

/**
 * Request logging middleware using Morgan
 */
const requestLogging = morgan(morganFormat, {
    stream: {
        write: (message) => {
            requestLogger.info(message.trim());
        }
    }
});

/**
 * Detailed request logger middleware
 */
const detailedRequestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Generate unique request ID
    req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Log request details
    requestLogger.info({
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
        headers: {
            authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : undefined,
            'content-type': req.headers['content-type'],
            'x-forwarded-for': req.headers['x-forwarded-for']
        },
        body: req.method === 'POST' || req.method === 'PUT' ?
            sanitizeLogData(req.body) : undefined
    });

    // Override res.json to log responses
    const originalJson = res.json;
    res.json = function (data) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log response details
        requestLogger.info({
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            success: res.statusCode < 400,
            responseSize: JSON.stringify(data).length,
            timestamp: new Date().toISOString()
        });

        return originalJson.call(this, data);
    };

    next();
};

/**
 * Security audit logger
 */
const securityLogger = (event, req, details = {}) => {
    requestLogger.warn({
        event: 'SECURITY_EVENT',
        type: event,
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        details
    });
};

/**
 * Authentication audit logger
 */
const authLogger = (event, req, user = null, success = true) => {
    requestLogger.info({
        event: 'AUTH_EVENT',
        type: event,
        success,
        userId: user?.id,
        username: user?.username,
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
};

/**
 * Transaction audit logger
 */
const transactionLogger = (event, req, transaction = {}) => {
    requestLogger.info({
        event: 'TRANSACTION_EVENT',
        type: event,
        transactionId: transaction.id,
        transactionRef: transaction.transaction_ref,
        amount: transaction.amount,
        currency: transaction.currency,
        fromAccountId: transaction.from_account_id,
        toAccountId: transaction.to_account_id,
        userId: req.user?.id,
        ip: getClientIP(req),
        timestamp: new Date().toISOString()
    });
};

/**
 * Admin action logger
 */
const adminLogger = (action, req, target = {}) => {
    requestLogger.warn({
        event: 'ADMIN_ACTION',
        action,
        adminId: req.user?.id,
        adminUsername: req.user?.username,
        targetType: target.type,
        targetId: target.id,
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
};

/**
 * Error logger
 */
const errorLogger = (error, req) => {
    requestLogger.error({
        event: 'ERROR',
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: getClientIP(req),
            userAgent: req.get('User-Agent'),
            userId: req.user?.id
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Sanitize sensitive data for logging
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitizeLogData = (data) => {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = [
        'password', 'newPassword', 'currentPassword', 'confirmPassword',
        'token', 'refreshToken', 'accessToken',
        'ssn', 'social_security', 'national_id',
        'card_number', 'cvv', 'pin',
        'account_number', 'routing_number'
    ];

    const sanitized = { ...data };

    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

module.exports = {
    requestLogging,
    detailedRequestLogger,
    securityLogger,
    authLogger,
    transactionLogger,
    adminLogger,
    errorLogger,
    sanitizeLogData,
    requestLogger
};
