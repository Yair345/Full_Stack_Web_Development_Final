const { validationResult } = require('express-validator');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const { sanitizeString } = require('../utils/helpers');

/**
 * Handle validation errors from express-validator
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: ERROR_MESSAGES.VALIDATION_ERROR,
            errors: formattedErrors
        });
    }

    next();
};

/**
 * Sanitize request body data
 */
const sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        const sanitizeObject = (obj) => {
            const sanitized = {};

            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string') {
                    sanitized[key] = sanitizeString(value);
                } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    sanitized[key] = sanitizeObject(value);
                } else {
                    sanitized[key] = value;
                }
            }

            return sanitized;
        };

        req.body = sanitizeObject(req.body);
    }

    next();
};

/**
 * Sanitize query parameters
 */
const sanitizeQuery = (req, res, next) => {
    if (req.query && typeof req.query === 'object') {
        for (const [key, value] of Object.entries(req.query)) {
            if (typeof value === 'string') {
                req.query[key] = sanitizeString(value);
            }
        }
    }

    next();
};

/**
 * Validate request content type for POST/PUT requests
 */
const validateContentType = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type');

        if (!contentType || !contentType.includes('application/json')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Content-Type must be application/json'
            });
        }
    }

    next();
};

/**
 * Validate required fields in request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} Middleware function
 */
const requireFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];

        requiredFields.forEach(field => {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Missing required fields',
                missingFields
            });
        }

        next();
    };
};

/**
 * Validate numeric fields
 * @param {Array} numericFields - Array of field names that should be numeric
 * @returns {Function} Middleware function
 */
const validateNumericFields = (numericFields) => {
    return (req, res, next) => {
        const invalidFields = [];

        numericFields.forEach(field => {
            const value = req.body[field];
            if (value !== undefined && value !== null && isNaN(Number(value))) {
                invalidFields.push(field);
            }
        });

        if (invalidFields.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid numeric values',
                invalidFields
            });
        }

        next();
    };
};

/**
 * Validate positive numeric values
 * @param {Array} positiveFields - Array of field names that should be positive numbers
 * @returns {Function} Middleware function
 */
const validatePositiveNumbers = (positiveFields) => {
    return (req, res, next) => {
        const invalidFields = [];

        positiveFields.forEach(field => {
            const value = Number(req.body[field]);
            if (!isNaN(value) && value <= 0) {
                invalidFields.push(field);
            }
        });

        if (invalidFields.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Values must be positive numbers',
                invalidFields
            });
        }

        next();
    };
};

/**
 * Validate enum values
 * @param {Object} enumFields - Object with field names as keys and allowed values as arrays
 * @returns {Function} Middleware function
 */
const validateEnumFields = (enumFields) => {
    return (req, res, next) => {
        const invalidFields = [];

        Object.entries(enumFields).forEach(([field, allowedValues]) => {
            const value = req.body[field];
            if (value !== undefined && !allowedValues.includes(value)) {
                invalidFields.push({
                    field,
                    value,
                    allowedValues
                });
            }
        });

        if (invalidFields.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid enum values',
                invalidFields
            });
        }

        next();
    };
};

/**
 * Validate date fields
 * @param {Array} dateFields - Array of field names that should be valid dates
 * @returns {Function} Middleware function
 */
const validateDateFields = (dateFields) => {
    return (req, res, next) => {
        const invalidFields = [];

        dateFields.forEach(field => {
            const value = req.body[field];
            if (value !== undefined && value !== null) {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    invalidFields.push(field);
                }
            }
        });

        if (invalidFields.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid date values',
                invalidFields
            });
        }

        next();
    };
};

/**
 * Validate request body size
 * @param {Number} maxSize - Maximum size in bytes
 * @returns {Function} Middleware function
 */
const validateBodySize = (maxSize = 1024 * 1024) => { // 1MB default
    return (req, res, next) => {
        const bodySize = Buffer.byteLength(JSON.stringify(req.body || {}));

        if (bodySize > maxSize) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Request body too large',
                maxSize,
                actualSize: bodySize
            });
        }

        next();
    };
};

/**
 * Validate stock transaction data
 */
const validateStockTransaction = [
    requireFields(['stockSymbol', 'quantity', 'pricePerShare']),
    validateNumericFields(['quantity', 'pricePerShare']),
    validatePositiveNumbers(['quantity', 'pricePerShare']),
    (req, res, next) => {
        const { stockSymbol, quantity, pricePerShare } = req.body;

        // Validate stock symbol format
        if (stockSymbol && (typeof stockSymbol !== 'string' || !/^[A-Z]{1,10}$/.test(stockSymbol.toUpperCase()))) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Stock symbol must be 1-10 uppercase letters',
                field: 'stockSymbol'
            });
        }

        // Validate quantity is integer
        if (quantity && !Number.isInteger(parseFloat(quantity))) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Quantity must be a whole number',
                field: 'quantity'
            });
        }

        // Validate maximum transaction amount
        const totalAmount = parseFloat(quantity) * parseFloat(pricePerShare);
        if (totalAmount > 1000000) { // Max $1M per transaction
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Transaction amount exceeds maximum limit of $1,000,000',
                field: 'totalAmount'
            });
        }

        // Convert stock symbol to uppercase
        req.body.stockSymbol = stockSymbol.toUpperCase();

        next();
    },
    handleValidationErrors
];

/**
 * Validate watchlist item data
 */
const validateWatchlistItem = [
    requireFields(['stockSymbol']),
    (req, res, next) => {
        const { stockSymbol, priceAboveAlert, priceBelowAlert, notes } = req.body;

        // Validate stock symbol format
        if (stockSymbol && (typeof stockSymbol !== 'string' || !/^[A-Z]{1,10}$/.test(stockSymbol.toUpperCase()))) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Stock symbol must be 1-10 uppercase letters',
                field: 'stockSymbol'
            });
        }

        // Validate alert prices if provided
        if (priceAboveAlert !== undefined && priceAboveAlert !== null) {
            const price = parseFloat(priceAboveAlert);
            if (isNaN(price) || price <= 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Price above alert must be a positive number',
                    field: 'priceAboveAlert'
                });
            }
        }

        if (priceBelowAlert !== undefined && priceBelowAlert !== null) {
            const price = parseFloat(priceBelowAlert);
            if (isNaN(price) || price <= 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Price below alert must be a positive number',
                    field: 'priceBelowAlert'
                });
            }
        }

        // Validate notes length if provided
        if (notes && typeof notes === 'string' && notes.length > 500) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Notes must not exceed 500 characters',
                field: 'notes'
            });
        }

        // Convert stock symbol to uppercase
        req.body.stockSymbol = stockSymbol.toUpperCase();

        next();
    },
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateRequest: handleValidationErrors, // Alias for compatibility
    sanitizeBody,
    sanitizeQuery,
    validateContentType,
    requireFields,
    validateNumericFields,
    validatePositiveNumbers,
    validateEnumFields,
    validateDateFields,
    validateBodySize,
    validateStockTransaction,
    validateWatchlistItem
};
