/**
 * Custom Error Classes for the Banking Application
 */

class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, false);
        this.name = 'DatabaseError';
    }
}

class ExternalServiceError extends AppError {
    constructor(message = 'External service error') {
        super(message, 502, false);
        this.name = 'ExternalServiceError';
    }
}

// Error response formatter
const formatError = (error, includeStack = false) => {
    const response = {
        status: error.status || 'error',
        message: error.message || 'Something went wrong',
        ...(error.statusCode && { statusCode: error.statusCode }),
        ...(error.errors && { errors: error.errors }),
        ...(includeStack && error.stack && { stack: error.stack })
    };

    return response;
};

// Error type checker
const isAppError = (error) => {
    return error instanceof AppError;
};

// HTTP status code helpers
const isClientError = (statusCode) => {
    return statusCode >= 400 && statusCode < 500;
};

const isServerError = (statusCode) => {
    return statusCode >= 500;
};

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    ExternalServiceError,
    formatError,
    isAppError,
    isClientError,
    isServerError
};
