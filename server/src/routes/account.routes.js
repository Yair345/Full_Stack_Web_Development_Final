const express = require('express');
const {
    getAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deactivateAccount,
    getBalance,
    getAccountTransactions,
    getAccountStatement,
    checkExistingAccounts
} = require('../controllers/account.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');
const {
    createAccountValidation,
    updateAccountValidation,
    accountIdValidation
} = require('../utils/validation.utils');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Check existing accounts endpoint
router.get('/check-existing', checkExistingAccounts);

// Account routes
router.get('/', getAccounts);
router.post('/', createAccountValidation, handleValidationErrors, createAccount);

router.get('/:id', accountIdValidation, handleValidationErrors, getAccount);
router.put('/:id', updateAccountValidation, handleValidationErrors, updateAccount);
router.delete('/:id', accountIdValidation, handleValidationErrors, deactivateAccount);

router.get('/:id/balance', accountIdValidation, handleValidationErrors, getBalance);
router.get('/:id/transactions', accountIdValidation, handleValidationErrors, getAccountTransactions);
router.get('/:id/statement', accountIdValidation, handleValidationErrors, getAccountStatement);

module.exports = router;
