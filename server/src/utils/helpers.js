const moment = require('moment');
const { PAGINATION, DATE_FORMATS } = require('./constants');

/**
 * Format currency amount
 * @param {Number} amount - Amount to format
 * @param {String} currency - Currency code
 * @returns {String} Formatted currency
 */
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Format date
 * @param {Date|String} date - Date to format
 * @param {String} format - Date format
 * @returns {String} Formatted date
 */
const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
    return moment(date).format(format);
};

/**
 * Get pagination params from query
 * @param {Object} query - Query parameters
 * @returns {Object} Pagination object
 */
const getPagination = (query) => {
    const page = parseInt(query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
        parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

/**
 * Create pagination response
 * @param {Array} data - Data array
 * @param {Number} total - Total count
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} Pagination response
 */
const createPaginationResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null
        }
    };
};

/**
 * Generate random string
 * @param {Number} length - String length
 * @returns {String} Random string
 */
const generateRandomString = (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} Is valid email
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {String} phone - Phone number to validate
 * @returns {Boolean} Is valid phone
 */
const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};

/**
 * Calculate age from date of birth
 * @param {Date|String} dateOfBirth - Date of birth
 * @returns {Number} Age in years
 */
const calculateAge = (dateOfBirth) => {
    return moment().diff(moment(dateOfBirth), 'years');
};

/**
 * Check if user is adult (18+)
 * @param {Date|String} dateOfBirth - Date of birth
 * @returns {Boolean} Is adult
 */
const isAdult = (dateOfBirth) => {
    return calculateAge(dateOfBirth) >= 18;
};

/**
 * Sanitize string input
 * @param {String} input - Input string
 * @returns {String} Sanitized string
 */
const sanitizeString = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

/**
 * Capitalize first letter of each word
 * @param {String} str - String to capitalize
 * @returns {String} Capitalized string
 */
const capitalizeWords = (str) => {
    return str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

/**
 * Generate slug from string
 * @param {String} str - String to slugify
 * @returns {String} Slug
 */
const slugify = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {Boolean} Is empty
 */
const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

/**
 * Convert string to boolean
 * @param {String} str - String to convert
 * @returns {Boolean} Boolean value
 */
const stringToBoolean = (str) => {
    return str === 'true' || str === '1' || str === 'yes';
};

/**
 * Format file size
 * @param {Number} bytes - Size in bytes
 * @returns {String} Formatted size
 */
const formatFileSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

/**
 * Get IP address from request
 * @param {Object} req - Express request object
 * @returns {String} IP address
 */
const getClientIP = (req) => {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

/**
 * Generate UUID v4
 * @returns {String} UUID
 */
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Delay execution
 * @param {Number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Number} maxRetries - Maximum retry attempts
 * @param {Number} delay - Initial delay in ms
 * @returns {Promise} Promise with retry logic
 */
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
};

module.exports = {
    formatCurrency,
    formatDate,
    getPagination,
    createPaginationResponse,
    generateRandomString,
    isValidEmail,
    isValidPhone,
    calculateAge,
    isAdult,
    sanitizeString,
    capitalizeWords,
    slugify,
    deepClone,
    isEmpty,
    stringToBoolean,
    formatFileSize,
    getClientIP,
    generateUUID,
    delay,
    retryWithBackoff
};
