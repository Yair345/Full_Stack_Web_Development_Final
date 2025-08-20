const express = require('express');
const router = express.Router();
const { query, param, body } = require('express-validator');

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');

// Import controllers
const {
    getBranches,
    getBranch,
    createBranch,
    updateBranch,
    deleteBranch,
    getBranchCustomers,
    getBranchLoans,
    getBranchPerformance,
    getPendingUsers,
    approveUser,
    rejectUser,
    createBranchDeposit,
    getBranchCustomerById,
    updateBranchCustomer
} = require('../controllers/branch.controller');

// Import validation schemas
const {
    createBranchValidation,
    updateBranchValidation
} = require('../utils/validation.utils');

// Simple validation middleware
const branchParamsValidation = [
    param('id').isInt({ min: 1 }).withMessage('Branch ID must be a positive integer')
];

const branchQueryValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters')
];

/**
 * @route GET /api/branches
 * @desc Get all branches
 * @access Private (Manager/Admin)
 */
router.get('/',
    authenticate,
    requireRole(['manager', 'admin']),
    branchQueryValidation,
    handleValidationErrors,
    getBranches
);

/**
 * @route GET /api/branches/:id
 * @desc Get branch by ID
 * @access Private (Manager/Admin)
 */
router.get('/:id',
    authenticate,
    requireRole(['manager', 'admin']),
    branchParamsValidation,
    handleValidationErrors,
    getBranch
);

/**
 * @route POST /api/branches
 * @desc Create new branch
 * @access Private (Admin only)
 */
router.post('/',
    authenticate,
    requireRole(['admin']),
    createBranchValidation,
    handleValidationErrors,
    createBranch
);

/**
 * @route PUT /api/branches/:id
 * @desc Update branch
 * @access Private (Admin/Manager)
 */
router.put('/:id',
    authenticate,
    requireRole(['admin', 'manager']),
    branchParamsValidation,
    updateBranchValidation,
    handleValidationErrors,
    updateBranch
);

/**
 * @route DELETE /api/branches/:id
 * @desc Delete branch (soft delete)
 * @access Private (Admin only)
 */
router.delete('/:id',
    authenticate,
    requireRole(['admin']),
    branchParamsValidation,
    handleValidationErrors,
    deleteBranch
);

/**
 * @route GET /api/branches/:id/customers
 * @desc Get branch customers
 * @access Private (Manager/Admin)
 */
router.get('/:id/customers',
    authenticate,
    requireRole(['manager', 'admin']),
    branchParamsValidation,
    branchQueryValidation,
    handleValidationErrors,
    getBranchCustomers
);

/**
 * @route GET /api/branches/:id/loans
 * @desc Get branch loan applications
 * @access Private (Manager/Admin)
 */
router.get('/:id/loans',
    authenticate,
    requireRole(['manager', 'admin']),
    branchParamsValidation,
    branchQueryValidation,
    handleValidationErrors,
    getBranchLoans
);

/**
 * @route GET /api/branches/:id/performance
 * @desc Get branch performance metrics
 * @access Private (Manager/Admin)
 */
router.get('/:id/performance',
    authenticate,
    requireRole(['manager', 'admin']),
    branchParamsValidation,
    [
        query('period').optional().isInt({ min: 1, max: 365 }).withMessage('Period must be between 1 and 365 days')
    ],
    handleValidationErrors,
    getBranchPerformance
);

/**
 * @route GET /api/branches/:id/pending-users
 * @desc Get pending users for branch approval
 * @access Private (Manager/Admin)
 */
router.get('/:id/pending-users',
    authenticate,
    requireRole(['manager', 'admin']),
    branchParamsValidation,
    handleValidationErrors,
    getPendingUsers
);

/**
 * @route PUT /api/branches/:id/approve-user/:userId
 * @desc Approve a user for branch membership
 * @access Private (Manager/Admin)
 */
router.put('/:id/approve-user/:userId',
    authenticate,
    requireRole(['manager', 'admin']),
    [
        param('id').isInt({ min: 1 }).withMessage('Branch ID must be a positive integer'),
        param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer')
    ],
    handleValidationErrors,
    approveUser
);

/**
 * @route PUT /api/branches/:id/reject-user/:userId
 * @desc Reject a user's branch membership request
 * @access Private (Manager/Admin)
 */
router.put('/:id/reject-user/:userId',
    authenticate,
    requireRole(['manager', 'admin']),
    [
        param('id').isInt({ min: 1 }).withMessage('Branch ID must be a positive integer'),
        param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer')
    ],
    handleValidationErrors,
    rejectUser
);

/**
 * @route POST /api/branches/:id/deposit
 * @desc Create branch deposit to customer account
 * @access Private (Manager/Admin)
 */
router.post('/:id/deposit',
    authenticate,
    requireRole(['manager', 'admin']),
    [
        param('id').isInt({ min: 1 }).withMessage('Branch ID must be a positive integer')
    ],
    handleValidationErrors,
    createBranchDeposit
);

/**
 * @route GET /api/branches/:id/customers/:userId
 * @desc Get specific customer details
 * @access Private (Manager/Admin)
 */
router.get('/:id/customers/:userId',
    authenticate,
    requireRole(['manager', 'admin']),
    [
        param('id').isInt({ min: 1 }).withMessage('Branch ID must be a positive integer'),
        param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer')
    ],
    handleValidationErrors,
    getBranchCustomerById
);

/**
 * @route PUT /api/branches/:id/customers/:userId
 * @desc Update customer information (limited fields for branch managers)
 * @access Private (Manager/Admin)
 */
router.put('/:id/customers/:userId',
    authenticate,
    requireRole(['manager', 'admin']),
    [
        param('id').isInt({ min: 1 }).withMessage('Branch ID must be a positive integer'),
        param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
        body('first_name')
            .optional()
            .isLength({ min: 1, max: 50 })
            .withMessage('First name must be between 1 and 50 characters'),
        body('last_name')
            .optional()
            .isLength({ min: 1, max: 50 })
            .withMessage('Last name must be between 1 and 50 characters'),
        body('email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Email must be valid'),
        body('phone')
            .optional()
            .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
            .withMessage('Phone must be a valid phone number'),
        body('address')
            .optional()
            .isLength({ min: 1, max: 200 })
            .withMessage('Address must be between 1 and 200 characters'),
        body('branch_id')
            .optional()
            .isInt()
            .withMessage('Branch ID must be a valid integer')
    ],
    handleValidationErrors,
    updateBranchCustomer
);

module.exports = router;
