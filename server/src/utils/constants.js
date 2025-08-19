// Application constants

// User roles
const USER_ROLES = {
    CUSTOMER: 'customer',
    MANAGER: 'manager',
    ADMIN: 'admin'
};

// Account types
const ACCOUNT_TYPES = {
    CHECKING: 'checking',
    SAVINGS: 'savings',
    BUSINESS: 'business'
};

// Account statuses
const ACCOUNT_STATUS = {
    ACTIVE: 'active',
    FROZEN: 'frozen',
    CLOSED: 'closed'
};

// Transaction types
const TRANSACTION_TYPES = {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    TRANSFER: 'transfer',
    PAYMENT: 'payment',
    FEE: 'fee',
    LOAN_DISBURSEMENT: 'loan_disbursement'
};

// Transaction statuses
const TRANSACTION_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

// Loan types
const LOAN_TYPES = {
    PERSONAL: 'personal',
    MORTGAGE: 'mortgage',
    AUTO: 'auto',
    BUSINESS: 'business'
};

// Loan statuses
const LOAN_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ACTIVE: 'active',
    PAID_OFF: 'paid_off',
    DEFAULTED: 'defaulted'
};

// Card types
const CARD_TYPES = {
    DEBIT: 'debit',
    CREDIT: 'credit'
};

// Card statuses
const CARD_STATUS = {
    ACTIVE: 'active',
    BLOCKED: 'blocked',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
};

// Standing order frequencies
const STANDING_ORDER_FREQUENCIES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly'
};

// Standing order statuses
const STANDING_ORDER_STATUS = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
};

// HTTP status codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// Error messages
const ERROR_MESSAGES = {
    // Authentication errors
    INVALID_CREDENTIALS: 'Invalid username or password',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',

    // User errors
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User already exists',
    USER_INACTIVE: 'User account is inactive',

    // Account errors
    ACCOUNT_NOT_FOUND: 'Account not found',
    ACCOUNT_FROZEN: 'Account is frozen',
    ACCOUNT_CLOSED: 'Account is closed',
    INSUFFICIENT_FUNDS: 'Insufficient funds',

    // Transaction errors
    TRANSACTION_NOT_FOUND: 'Transaction not found',
    TRANSACTION_FAILED: 'Transaction failed',
    INVALID_AMOUNT: 'Invalid transaction amount',
    SAME_ACCOUNT_TRANSFER: 'Cannot transfer to the same account',

    // General errors
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'Internal server error',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Bad request'
};

// Success messages
const SUCCESS_MESSAGES = {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    ACCOUNT_CREATED: 'Account created successfully',
    TRANSACTION_SUCCESS: 'Transaction completed successfully',
    PASSWORD_RESET_SENT: 'Password reset email sent',
    PASSWORD_CHANGED: 'Password changed successfully',
    EMAIL_VERIFIED: 'Email verified successfully'
};

// Pagination defaults
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
};

// Rate limiting
const RATE_LIMITS = {
    GENERAL: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // requests per window
    },
    AUTH: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5 // login attempts per window
    },
    TRANSACTION: {
        windowMs: 60 * 1000, // 1 minute
        max: 10 // transactions per minute
    }
};

// File upload constraints
const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
    UPLOAD_PATH: './uploads/'
};

// Email templates
const EMAIL_TEMPLATES = {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password_reset',
    TRANSACTION_ALERT: 'transaction_alert',
    LOGIN_ALERT: 'login_alert',
    MONTHLY_STATEMENT: 'monthly_statement'
};

// Audit log levels
const AUDIT_LEVELS = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

// Banking limits
const BANKING_LIMITS = {
    DAILY_TRANSACTION_LIMIT: 10000,
    MONTHLY_TRANSACTION_LIMIT: 50000,
    MAX_ACCOUNT_BALANCE: 1000000,
    MIN_TRANSACTION_AMOUNT: 0.01,
    MAX_TRANSACTION_AMOUNT: 100000
};

// Interest rates (annual percentage)
const INTEREST_RATES = {
    SAVINGS: 2.5,
    CHECKING: 0.1,
    CREDIT: 18.0,
    PERSONAL_LOAN: 12.0,
    MORTGAGE: 4.5,
    AUTO_LOAN: 7.0
};

// Fees
const FEES = {
    TRANSFER_FEE: 2.50,
    WITHDRAWAL_FEE: 1.00,
    OVERDRAFT_FEE: 35.00,
    MONTHLY_MAINTENANCE: 10.00,
    CARD_REPLACEMENT: 25.00
};

// Currency codes
const CURRENCIES = {
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
    JPY: 'JPY',
    ILS: 'ILS'
};

// Date formats
const DATE_FORMATS = {
    ISO: 'YYYY-MM-DD',
    DISPLAY: 'DD/MM/YYYY',
    TIMESTAMP: 'YYYY-MM-DD HH:mm:ss'
};

module.exports = {
    USER_ROLES,
    ACCOUNT_TYPES,
    ACCOUNT_STATUS,
    TRANSACTION_TYPES,
    TRANSACTION_STATUS,
    LOAN_TYPES,
    LOAN_STATUS,
    CARD_TYPES,
    CARD_STATUS,
    STANDING_ORDER_FREQUENCIES,
    STANDING_ORDER_STATUS,
    HTTP_STATUS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    PAGINATION,
    RATE_LIMITS,
    FILE_UPLOAD,
    EMAIL_TEMPLATES,
    AUDIT_LEVELS,
    BANKING_LIMITS,
    INTEREST_RATES,
    FEES,
    CURRENCIES,
    DATE_FORMATS
};
