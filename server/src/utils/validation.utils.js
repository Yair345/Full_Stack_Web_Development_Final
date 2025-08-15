const { body, param, validationResult } = require('express-validator');

/**
 * User registration validation rules
 */
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    body('first_name')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),

    body('last_name')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),

    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('Please provide a valid phone number'),

    body('date_of_birth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth'),

    body('national_id')
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage('National ID must be between 5 and 20 characters')
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('National ID can only contain letters and numbers'),

    body('address')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Address cannot exceed 500 characters')
];

/**
 * User login validation rules
 */
const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Change password validation rules
 */
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

/**
 * Forgot password validation rules
 */
const forgotPasswordValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
];

/**
 * Reset password validation rules
 */
const resetPasswordValidation = [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required'),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

/**
 * Update profile validation rules
 */
const updateProfileValidation = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('phone_number')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),

    body('address')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Address cannot exceed 500 characters')
];

/**
 * Account creation validation rules
 */
const createAccountValidation = [
    body('account_type')
        .isIn(['checking', 'savings', 'business'])
        .withMessage('Account type must be checking, savings, or business'),

    body('currency')
        .optional()
        .isIn(['USD', 'EUR', 'GBP'])
        .withMessage('Currency must be USD, EUR, or GBP')
];

/**
 * Account update validation rules
 */
const updateAccountValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid account ID is required'),

    body('account_type')
        .optional()
        .isIn(['checking', 'savings', 'business'])
        .withMessage('Account type must be checking, savings, or business')
];

/**
 * Account ID validation rules
 */
const accountIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid account ID is required')
];

/**
 * Transfer validation rules
 */
const transferValidation = [
    body('from_account_id')
        .isInt({ min: 1 })
        .withMessage('Valid source account ID is required'),

    body('to_account_number')
        .isLength({ min: 10, max: 20 })
        .withMessage('Valid destination account number is required'),

    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),

    body('description')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Description cannot exceed 255 characters'),

    body('transfer_type')
        .optional()
        .isIn(['internal', 'external'])
        .withMessage('Transfer type must be internal or external')
];

/**
 * Deposit validation rules
 */
const depositValidation = [
    body('account_id')
        .isInt({ min: 1 })
        .withMessage('Valid account ID is required'),

    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),

    body('description')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Description cannot exceed 255 characters')
];

/**
 * Withdrawal validation rules
 */
const withdrawalValidation = [
    body('account_id')
        .isInt({ min: 1 })
        .withMessage('Valid account ID is required'),

    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),

    body('description')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Description cannot exceed 255 characters')
];

/**
 * Transaction ID validation rules
 */
const transactionIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid transaction ID is required')
];

/**
 * Validation result checker
 */
const checkValidationResult = (req, res, next) => {
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

module.exports = {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    updateProfileValidation,
    createAccountValidation,
    updateAccountValidation,
    accountIdValidation,
    transferValidation,
    depositValidation,
    withdrawalValidation,
    transactionIdValidation,
    checkValidationResult
};
