const express = require('express');
const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const transactionRoutes = require('./transaction.routes');
const standingOrderRoutes = require('./standingOrder.routes');
const loanRoutes = require('./loan.routes');
const cardRoutes = require('./card.routes');
const auditRoutes = require('./audit.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/standing-orders', standingOrderRoutes);
router.use('/loans', loanRoutes);
router.use('/cards', cardRoutes);
router.use('/audit', auditRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});

module.exports = router;
