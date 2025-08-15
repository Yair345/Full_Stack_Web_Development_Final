const express = require('express');
const AuditService = require('../services/audit.service');
const { authenticate } = require('../middleware/auth.middleware');
const { catchAsync } = require('../middleware/error.middleware');

const router = express.Router();

/**
 * @desc Get audit logs (admin only)
 * @route GET /api/audit/logs
 * @access Private (Admin)
 */
const getAuditLogs = catchAsync(async (req, res) => {
    const { page = 1, limit = 20, action, userId, level } = req.query;

    // Build filters
    const filters = {};
    if (action) filters.action = { $regex: action, $options: 'i' };
    if (userId) filters.userId = userId;
    if (level) filters.level = level;

    const options = {
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        sort: { timestamp: -1 }
    };

    const result = await AuditService.getAuditLogs(filters, options);

    res.json({
        success: true,
        data: result
    });
});

/**
 * @desc Get recent audit logs (for testing)
 * @route GET /api/audit/recent
 * @access Private
 */
const getRecentLogs = catchAsync(async (req, res) => {
    const result = await AuditService.getAuditLogs({}, {
        limit: 10,
        skip: 0,
        sort: { timestamp: -1 }
    });

    res.json({
        success: true,
        message: `Found ${result.total} total audit logs`,
        data: result
    });
});

// Routes
router.get('/logs', authenticate, getAuditLogs);
router.get('/recent', authenticate, getRecentLogs);

module.exports = router;
