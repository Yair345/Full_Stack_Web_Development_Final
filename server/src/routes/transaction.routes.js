const express = require('express');
const {
    getTransactions,
    getTransaction,
    createTransfer,
    createDeposit,
    createWithdrawal,
    getTransactionSummary,
    cancelTransaction
} = require('../controllers/transaction.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');
const {
    transferValidation,
    depositValidation,
    withdrawalValidation,
    transactionIdValidation
} = require('../utils/validation.utils');

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Transaction routes
router.get('/', getTransactions);
router.get('/summary', getTransactionSummary);
router.get('/:id', transactionIdValidation, handleValidationErrors, getTransaction);

// Transaction creation
router.post('/transfer', transferValidation, handleValidationErrors, createTransfer);
router.post('/deposit', depositValidation, handleValidationErrors, createDeposit);
router.post('/withdrawal', withdrawalValidation, handleValidationErrors, createWithdrawal);

// Transaction management
router.put('/:id/cancel', transactionIdValidation, handleValidationErrors, cancelTransaction);

module.exports = router;
