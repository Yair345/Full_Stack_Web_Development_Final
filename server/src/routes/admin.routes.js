const express = require('express');
const {
    getAdminOverview,
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    getBranches,
    getAvailableManagers,
    createBranch,
    updateBranch,
    deleteBranch
} = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { body, param } = require('express-validator');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

// Apply authentication and admin role requirement to all routes
router.use(authenticate);
router.use(requireRole([USER_ROLES.ADMIN]));

/**
 * @desc Get admin dashboard overview
 * @route GET /api/admin/overview
 * @access Private (Admin only)
 */
router.get('/overview', getAdminOverview);

/**
 * @desc Get all users for admin management
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
router.get('/users', getUsers);

/**
 * @desc Get single user by ID for admin/manager management
 * @route GET /api/admin/users/:id
 * @access Private (Admin/Manager)
 */
router.get(
    '/users/:id',
    requireRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]), // Override to allow managers
    [
        param('id').isInt().withMessage('User ID must be a valid integer')
    ],
    validateRequest,
    getUserById
);

/**
 * @desc Update user information
 * @route PUT /api/admin/users/:id
 * @access Private (Admin/Manager)
 */
router.put(
    '/users/:id',
    requireRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]), // Override to allow managers
    [
        param('id').isInt().withMessage('User ID must be a valid integer'),
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
        body('role')
            .optional()
            .isIn(['customer', 'manager', 'admin'])
            .withMessage('Invalid role provided'),
        body('branch_id')
            .optional()
            .isInt()
            .withMessage('Branch ID must be a valid integer')
    ],
    validateRequest,
    updateUser
);

/**
 * @desc Update user status (activate, deactivate, approve, reject, suspend, unsuspend)
 * @route PUT /api/admin/users/:id/status
 * @access Private (Admin only)
 */
router.put(
    '/users/:id/status',
    [
        param('id').isInt().withMessage('User ID must be a valid integer'),
        body('action')
            .isIn(['activate', 'deactivate', 'approve', 'reject', 'suspend', 'unsuspend'])
            .withMessage('Invalid action provided'),
        body('reason')
            .optional({ values: 'falsy' })
            .isLength({ min: 1, max: 500 })
            .withMessage('Reason must be between 1 and 500 characters')
    ],
    validateRequest,
    updateUserStatus
);

/**
 * @desc Get all branches for admin management
 * @route GET /api/admin/branches
 * @access Private (Admin only)
 */
router.get('/branches', getBranches);

/**
 * @desc Get available managers for branch assignment
 * @route GET /api/admin/available-managers
 * @access Private (Admin only)
 */
router.get('/available-managers', getAvailableManagers);

/**
 * @desc Create new branch
 * @route POST /api/admin/branches
 * @access Private (Admin only)
 */
router.post(
    '/branches',
    [
        body('branch_name')
            .notEmpty()
            .isLength({ min: 2, max: 100 })
            .withMessage('Branch name must be between 2 and 100 characters'),
        body('branch_code')
            .optional()
            .isLength({ min: 2, max: 20 })
            .matches(/^[A-Z0-9_-]+$/)
            .withMessage('Branch code must contain only uppercase letters, numbers, hyphens, and underscores'),
        body('address')
            .notEmpty()
            .isLength({ min: 5, max: 200 })
            .withMessage('Address must be between 5 and 200 characters'),
        body('city')
            .notEmpty()
            .isLength({ min: 2, max: 50 })
            .withMessage('City must be between 2 and 50 characters'),
        body('state')
            .notEmpty()
            .isLength({ min: 2, max: 50 })
            .withMessage('State must be between 2 and 50 characters'),
        body('postal_code')
            .notEmpty()
            .matches(/^[0-9]{5,7}$/)
            .withMessage('Postal code must be 5-7 digits'),
        body('country')
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage('Country must be between 2 and 50 characters'),
        body('phone')
            .notEmpty()
            .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
            .withMessage('Phone must be a valid phone number'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email must be valid'),
        body('manager_id')
            .optional()
            .isInt()
            .withMessage('Manager ID must be a valid integer'),
        body('opening_hours')
            .optional()
            .isObject()
            .withMessage('Opening hours must be an object'),
        body('services_offered')
            .optional()
            .isArray()
            .withMessage('Services offered must be an array')
    ],
    validateRequest,
    createBranch
);

/**
 * @desc Update branch
 * @route PUT /api/admin/branches/:id
 * @access Private (Admin only)
 */
router.put(
    '/branches/:id',
    [
        param('id').isInt().withMessage('Branch ID must be a valid integer'),
        body('branch_name')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('Branch name must be between 2 and 100 characters'),
        body('branch_code')
            .optional()
            .isLength({ min: 2, max: 20 })
            .matches(/^[A-Z0-9_-]+$/)
            .withMessage('Branch code must contain only uppercase letters, numbers, hyphens, and underscores'),
        body('address')
            .optional()
            .isLength({ min: 5, max: 200 })
            .withMessage('Address must be between 5 and 200 characters'),
        body('city')
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage('City must be between 2 and 50 characters'),
        body('state')
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage('State must be between 2 and 50 characters'),
        body('postal_code')
            .optional()
            .matches(/^[0-9]{5,7}$/)
            .withMessage('Postal code must be 5-7 digits'),
        body('country')
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage('Country must be between 2 and 50 characters'),
        body('phone')
            .optional()
            .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
            .withMessage('Phone must be a valid phone number'),
        body('email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Email must be valid'),
        body('manager_id')
            .optional()
            .isInt()
            .withMessage('Manager ID must be a valid integer'),
        body('is_active')
            .optional()
            .isBoolean()
            .withMessage('is_active must be a boolean'),
        body('opening_hours')
            .optional()
            .isObject()
            .withMessage('Opening hours must be an object'),
        body('services_offered')
            .optional()
            .isArray()
            .withMessage('Services offered must be an array')
    ],
    validateRequest,
    updateBranch
);

/**
 * @desc Delete branch (soft delete)
 * @route DELETE /api/admin/branches/:id
 * @access Private (Admin only)
 */
router.delete(
    '/branches/:id',
    [
        param('id').isInt().withMessage('Branch ID must be a valid integer')
    ],
    validateRequest,
    deleteBranch
);

module.exports = router;
