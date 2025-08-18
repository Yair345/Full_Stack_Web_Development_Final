const { body, param, validationResult } = require('express-validator');
const { LOAN_TYPES } = require('./constants');

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

    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
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
        .isIn(['USD', 'EUR', 'GBP', 'JPY', 'ILS'])
        .withMessage('Currency must be USD, EUR, GBP, JPY, or ILS'),

    body('account_name')
        .notEmpty()
        .withMessage('Account name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Account name must be between 2 and 100 characters'),

    body('initial_deposit')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Initial deposit must be a positive number'),

    body('overdraft_limit')
        .optional()
        .isFloat({ min: 0, max: 50000 })
        .withMessage('Overdraft limit must be between 0 and 50,000')
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
        .custom((value) => {
            if (!value || value.trim().length === 0) {
                throw new Error('Destination account number or email is required');
            }

            const trimmedValue = value.trim();

            // Allow account numbers (flexible pattern), email addresses, or alphanumeric account identifiers
            const isAccountNumber = /^\d{4,20}$/.test(trimmedValue); // 4-20 digits for traditional account numbers
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue); // Email pattern
            const isAlphaNumeric = /^[a-zA-Z0-9_-]{3,50}$/.test(trimmedValue); // Alphanumeric account identifiers

            if (!isAccountNumber && !isEmail && !isAlphaNumeric) {
                throw new Error('Destination must be a valid account number (4-20 digits), alphanumeric identifier (3-50 characters), or email address');
            }

            return true;
        }),

    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),

    body('description')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Description cannot exceed 255 characters'),

    body('transfer_type')
        .optional()
        .isIn(['internal', 'external', 'wire'])
        .withMessage('Transfer type must be internal, external, or wire')
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
 * Standing order creation validation rules
 */
const createStandingOrderValidation = [
    body('from_account_id')
        .isInt({ min: 1 })
        .withMessage('Valid source account ID is required'),

    body('to_account_number')
        .custom((value) => {
            // Allow account numbers (10-20 characters) or email addresses
            const isAccountNumber = /^\d{10,20}$/.test(value);
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

            if (!isAccountNumber && !isEmail && (value.length < 10 || value.length > 50)) {
                throw new Error('Valid destination account number (10-20 digits) or email address is required');
            }

            return true;
        }),

    body('beneficiary_name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Beneficiary name must be between 1 and 100 characters'),

    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),

    body('frequency')
        .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
        .withMessage('Frequency must be daily, weekly, monthly, quarterly, or yearly'),

    body('start_date')
        .isISO8601()
        .withMessage('Valid start date is required'),

    body('end_date')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),

    body('max_executions')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max executions must be a positive integer'),

    body('reference')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Reference cannot exceed 100 characters'),

    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
];

/**
 * Standing order update validation rules
 */
const updateStandingOrderValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid standing order ID is required'),

    body('beneficiary_name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Beneficiary name must be between 1 and 100 characters'),

    body('amount')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),

    body('frequency')
        .optional()
        .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
        .withMessage('Frequency must be daily, weekly, monthly, quarterly, or yearly'),

    body('end_date')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),

    body('max_executions')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max executions must be a positive integer'),

    body('reference')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Reference cannot exceed 100 characters'),

    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
];

/**
 * Standing order ID validation rules
 */
const standingOrderIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid standing order ID is required')
];

/**
 * Loan application validation rules
 */
const loanApplicationValidation = [
    body('loan_type')
        .isIn(Object.values(LOAN_TYPES))
        .withMessage('Invalid loan type'),

    body('amount')
        .isFloat({ min: 1000, max: 10000000 })
        .withMessage('Loan amount must be between $1,000 and $10,000,000'),

    body('interest_rate')
        .isFloat({ min: 0.0001, max: 0.5 })
        .withMessage('Interest rate must be between 0.01% and 50%'),

    body('term_months')
        .isInt({ min: 6, max: 480 })
        .withMessage('Loan term must be between 6 and 480 months'),

    body('purpose')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Loan purpose must be between 10 and 1000 characters'),

    body('collateral_description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Collateral description cannot exceed 1000 characters'),

    body('collateral_value')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Collateral value must be a positive number'),

    body('credit_score')
        .optional()
        .isInt({ min: 300, max: 850 })
        .withMessage('Credit score must be between 300 and 850'),

    body('debt_to_income_ratio')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Debt to income ratio must be between 0% and 100%'),

    body('annual_income')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Annual income must be a positive number')
];

/**
 * Loan update validation rules
 */
const loanUpdateValidation = [
    body('purpose')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Loan purpose must be between 10 and 1000 characters'),

    body('collateral_description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Collateral description cannot exceed 1000 characters'),

    body('collateral_value')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Collateral value must be a positive number'),

    body('credit_score')
        .optional()
        .isInt({ min: 300, max: 850 })
        .withMessage('Credit score must be between 300 and 850'),

    body('debt_to_income_ratio')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Debt to income ratio must be between 0% and 100%'),

    body('annual_income')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Annual income must be a positive number')
];

/**
 * Loan payment validation rules
 */
const loanPaymentValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid loan ID is required'),

    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Payment amount must be greater than 0')
];

/**
 * Loan ID validation rules
 */
const loanIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid loan ID is required')
];

/**
 * Loan calculation validation rules
 */
const loanCalculationValidation = [
    body('amount')
        .isFloat({ min: 1000, max: 10000000 })
        .withMessage('Loan amount must be between $1,000 and $10,000,000'),

    body('interest_rate')
        .isFloat({ min: 0.0001, max: 0.5 })
        .withMessage('Interest rate must be between 0.01% and 50%'),

    body('term_months')
        .isInt({ min: 6, max: 480 })
        .withMessage('Loan term must be between 6 and 480 months')
];

/**
 * Simple validation function for controller use
 */
const validateLoanApplication = (data) => {
    const errors = [];
    
    if (!data.loan_type || !Object.values(LOAN_TYPES).includes(data.loan_type)) {
        errors.push('Invalid loan type');
    }
    
    if (!data.amount || data.amount < 1000 || data.amount > 10000000) {
        errors.push('Loan amount must be between $1,000 and $10,000,000');
    }
    
    if (!data.interest_rate || data.interest_rate < 0.0001 || data.interest_rate > 0.5) {
        errors.push('Interest rate must be between 0.01% and 50%');
    }
    
    if (!data.term_months || data.term_months < 6 || data.term_months > 480) {
        errors.push('Loan term must be between 6 and 480 months');
    }
    
    if (!data.purpose || data.purpose.trim().length < 10 || data.purpose.trim().length > 1000) {
        errors.push('Loan purpose must be between 10 and 1000 characters');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Simple validation function for loan update
 */
const validateLoanUpdate = (data) => {
    const errors = [];
    
    if (data.purpose && (data.purpose.trim().length < 10 || data.purpose.trim().length > 1000)) {
        errors.push('Loan purpose must be between 10 and 1000 characters');
    }
    
    if (data.collateral_value && data.collateral_value < 0) {
        errors.push('Collateral value must be a positive number');
    }
    
    if (data.credit_score && (data.credit_score < 300 || data.credit_score > 850)) {
        errors.push('Credit score must be between 300 and 850');
    }
    
    if (data.debt_to_income_ratio && (data.debt_to_income_ratio < 0 || data.debt_to_income_ratio > 100)) {
        errors.push('Debt to income ratio must be between 0% and 100%');
    }
    
    if (data.annual_income && data.annual_income < 0) {
        errors.push('Annual income must be a positive number');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

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
    createStandingOrderValidation,
    updateStandingOrderValidation,
    standingOrderIdValidation,
    loanApplicationValidation,
    loanUpdateValidation,
    loanPaymentValidation,
    loanIdValidation,
    loanCalculationValidation,
    validateLoanApplication,
    validateLoanUpdate,
    checkValidationResult
};
