const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 * @returns {Object|Function} Error response or next()
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * User registration validation rules
 */
const validateUserRegistration = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('first_name')
        .isLength({ min: 1, max: 50 })
        .withMessage('First name is required and must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),

    body('last_name')
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name is required and must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),

    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('Please provide a valid phone number'),

    body('date_of_birth')
        .isISO8601()
        .withMessage('Please provide a valid date of birth (YYYY-MM-DD)')
        .custom((value) => {
            const age = new Date().getFullYear() - new Date(value).getFullYear();
            if (age < 18) {
                throw new Error('Must be at least 18 years old');
            }
            return true;
        }),

    body('national_id')
        .isLength({ min: 5, max: 20 })
        .withMessage('National ID must be between 5 and 20 characters')
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('National ID can only contain letters and numbers'),

    handleValidationErrors
];

/**
 * User login validation rules
 */
const validateUserLogin = [
    body('username')
        .notEmpty()
        .withMessage('Username or email is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

/**
 * Transaction validation rules
 */
const validateTransaction = [
    body('from_account_id')
        .isInt({ min: 1 })
        .withMessage('Valid from account ID is required'),

    body('to_account_id')
        .isInt({ min: 1 })
        .withMessage('Valid to account ID is required'),

    body('amount')
        .isFloat({ min: 0.01, max: 100000 })
        .withMessage('Amount must be between 0.01 and 100,000'),

    body('description')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Description must be less than 255 characters'),

    handleValidationErrors
];

/**
 * Account creation validation rules
 */
const validateAccountCreation = [
    body('account_type')
        .isIn(['checking', 'savings', 'credit'])
        .withMessage('Account type must be checking, savings, or credit'),

    body('initial_deposit')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Initial deposit must be a positive number'),

    handleValidationErrors
];

/**
 * Password reset validation rules
 */
const validatePasswordReset = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    handleValidationErrors
];

/**
 * Password change validation rules
 */
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Password confirmation does not match new password');
            }
            return true;
        }),

    handleValidationErrors
];

/**
 * Loan application validation rules
 */
const validateLoanApplication = [
    body('loan_type')
        .isIn(['personal', 'mortgage', 'auto', 'business'])
        .withMessage('Loan type must be personal, mortgage, auto, or business'),

    body('amount')
        .isFloat({ min: 1000, max: 1000000 })
        .withMessage('Loan amount must be between 1,000 and 1,000,000'),

    body('term_months')
        .isInt({ min: 6, max: 360 })
        .withMessage('Loan term must be between 6 and 360 months'),

    body('purpose')
        .isLength({ min: 10, max: 500 })
        .withMessage('Purpose must be between 10 and 500 characters'),

    handleValidationErrors
];

/**
 * ID parameter validation
 */
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid ID is required'),

    handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    handleValidationErrors
];

/**
 * Custom validation for account number format
 */
const isValidAccountNumber = (value) => {
    return /^\d{13}$/.test(value);
};

/**
 * Custom validation for email format
 */
const isValidEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};

/**
 * Custom validation for phone number format
 */
const isValidPhoneNumber = (value) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(value);
};

module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateTransaction,
    validateAccountCreation,
    validatePasswordReset,
    validatePasswordChange,
    validateLoanApplication,
    validateId,
    validatePagination,
    isValidAccountNumber,
    isValidEmail,
    isValidPhoneNumber
};
