const express = require('express');
const {
    getStandingOrders,
    getStandingOrder,
    createStandingOrder,
    updateStandingOrder,
    toggleStandingOrderStatus,
    cancelStandingOrder
} = require('../controllers/standingOrder.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');
const {
    createStandingOrderValidation,
    updateStandingOrderValidation,
    standingOrderIdValidation
} = require('../utils/validation.utils');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Standing order routes
router.get('/', getStandingOrders);
router.post('/', createStandingOrderValidation, handleValidationErrors, createStandingOrder);

router.get('/:id', standingOrderIdValidation, handleValidationErrors, getStandingOrder);
router.put('/:id', updateStandingOrderValidation, handleValidationErrors, updateStandingOrder);
router.put('/:id/toggle', standingOrderIdValidation, handleValidationErrors, toggleStandingOrderStatus);
router.delete('/:id', standingOrderIdValidation, handleValidationErrors, cancelStandingOrder);

module.exports = router;
