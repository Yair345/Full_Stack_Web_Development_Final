const express = require('express');
const {
    getCards,
    getCard,
    createCard,
    updateCard,
    toggleCardBlock,
    cancelCard,
    changePin
} = require('../controllers/card.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');
const { body, param, query } = require('express-validator');
const { CARD_TYPES, CARD_STATUS } = require('../utils/constants');

const router = express.Router();

// Validation schemas
const createCardValidation = [
    body('account_id')
        .isInt({ min: 1 })
        .withMessage('Account ID must be a positive integer'),
    body('card_type')
        .isIn(Object.values(CARD_TYPES))
        .withMessage('Card type must be debit or credit'),
    body('card_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Card name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s.'-]+$/)
        .withMessage('Card name can only contain letters, spaces, periods, apostrophes, and hyphens'),
    body('daily_limit')
        .optional()
        .isFloat({ min: 0, max: 50000 })
        .withMessage('Daily limit must be between 0 and 50,000'),
    body('monthly_limit')
        .optional()
        .isFloat({ min: 0, max: 1000000 })
        .withMessage('Monthly limit must be between 0 and 1,000,000'),
    body('pin')
        .optional()
        .matches(/^\d{4}$/)
        .withMessage('PIN must be exactly 4 digits')
];

const updateCardValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Card ID must be a positive integer'),
    body('card_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Card name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s.'-]+$/)
        .withMessage('Card name can only contain letters, spaces, periods, apostrophes, and hyphens'),
    body('daily_limit')
        .optional()
        .isFloat({ min: 0, max: 50000 })
        .withMessage('Daily limit must be between 0 and 50,000'),
    body('monthly_limit')
        .optional()
        .isFloat({ min: 0, max: 1000000 })
        .withMessage('Monthly limit must be between 0 and 1,000,000'),
    body('contactless_enabled')
        .optional()
        .isBoolean()
        .withMessage('Contactless enabled must be a boolean'),
    body('online_transactions_enabled')
        .optional()
        .isBoolean()
        .withMessage('Online transactions enabled must be a boolean'),
    body('international_transactions_enabled')
        .optional()
        .isBoolean()
        .withMessage('International transactions enabled must be a boolean')
];

const cardIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Card ID must be a positive integer')
];

const changePinValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Card ID must be a positive integer'),
    body('current_pin')
        .optional()
        .matches(/^\d{4}$/)
        .withMessage('Current PIN must be exactly 4 digits'),
    body('new_pin')
        .matches(/^\d{4}$/)
        .withMessage('New PIN must be exactly 4 digits')
];

const getCardsValidation = [
    query('account_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Account ID must be a positive integer'),
    query('status')
        .optional()
        .isIn(Object.values(CARD_STATUS))
        .withMessage('Status must be a valid card status'),
    query('card_type')
        .optional()
        .isIn(Object.values(CARD_TYPES))
        .withMessage('Card type must be debit or credit')
];

// Apply authentication to all routes
router.use(authenticate);

// Routes
/**
 * @route   GET /api/v1/cards
 * @desc    Get all cards for the authenticated user
 * @access  Private
 * @query   ?account_id=123&status=active&card_type=debit
 */
router.get('/', getCardsValidation, handleValidationErrors, getCards);

/**
 * @route   POST /api/v1/cards
 * @desc    Create a new card
 * @access  Private
 * @body    { account_id, card_type, card_name?, daily_limit?, monthly_limit?, pin? }
 */
router.post('/', createCardValidation, handleValidationErrors, createCard);

/**
 * @route   GET /api/v1/cards/:id
 * @desc    Get a specific card by ID
 * @access  Private
 * @params  id - Card ID
 */
router.get('/:id', cardIdValidation, handleValidationErrors, getCard);

/**
 * @route   PUT /api/v1/cards/:id
 * @desc    Update card settings
 * @access  Private
 * @params  id - Card ID
 * @body    { card_name?, daily_limit?, monthly_limit?, contactless_enabled?, online_transactions_enabled?, international_transactions_enabled? }
 */
router.put('/:id', updateCardValidation, handleValidationErrors, updateCard);

/**
 * @route   PUT /api/v1/cards/:id/toggle-block
 * @desc    Block/unblock a card
 * @access  Private
 * @params  id - Card ID
 */
router.put('/:id/toggle-block', cardIdValidation, handleValidationErrors, toggleCardBlock);

/**
 * @route   DELETE /api/v1/cards/:id
 * @desc    Cancel a card (soft delete)
 * @access  Private
 * @params  id - Card ID
 */
router.delete('/:id', cardIdValidation, handleValidationErrors, cancelCard);

/**
 * @route   PUT /api/v1/cards/:id/change-pin
 * @desc    Change card PIN
 * @access  Private
 * @params  id - Card ID
 * @body    { current_pin?, new_pin }
 */
router.put('/:id/change-pin', changePinValidation, handleValidationErrors, changePin);

module.exports = router;
