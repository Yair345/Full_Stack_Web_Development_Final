const express = require('express');
const {
    getLoans,
    getLoan,
    createLoanApplication,
    updateLoanApplication,
    makeLoanPayment,
    getLoanSummary,
    calculateLoanPayment,
    updateLoanStatus,
    getBranchLoans,
    approveBranchLoan
} = require('../controllers/loan.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { transactionLimiter } = require('../middleware/rateLimiter.middleware');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

// Apply authentication to all loan routes
router.use(authenticate);

// GET /api/v1/loans - Get user's loans
router.get('/', getLoans);

// GET /api/v1/loans/summary - Get loan summary/statistics
router.get('/summary', getLoanSummary);

// POST /api/v1/loans/calculate - Calculate loan payment (loan calculator)
router.post('/calculate', calculateLoanPayment);

// POST /api/v1/loans - Create new loan application
router.post('/', transactionLimiter, createLoanApplication);

// GET /api/v1/loans/:id - Get specific loan
router.get('/:id', getLoan);

// PUT /api/v1/loans/:id - Update loan application (only for pending loans)
router.put('/:id', updateLoanApplication);

// POST /api/v1/loans/:id/payment - Make loan payment
router.post('/:id/payment', transactionLimiter, makeLoanPayment);

// Branch manager routes - require manager or admin role
// GET /api/v1/loans/branch/all - Get all loans for manager's branch
router.get('/branch/all', requireRole([USER_ROLES.MANAGER, USER_ROLES.ADMIN]), getBranchLoans);

// PUT /api/v1/loans/:id/branch-approval - Approve or reject loan (branch manager or admin)
router.put('/:id/branch-approval', requireRole([USER_ROLES.MANAGER, USER_ROLES.ADMIN]), approveBranchLoan);

// Admin routes - require manager or admin role
// PUT /api/v1/loans/:id/status - Approve or reject loan (admin only)
router.put('/:id/status', requireRole([USER_ROLES.MANAGER, USER_ROLES.ADMIN]), updateLoanStatus);

module.exports = router;
