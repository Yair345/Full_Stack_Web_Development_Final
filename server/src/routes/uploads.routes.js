const express = require('express');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { USER_ROLES } = require('../utils/constants');
const { AppError } = require('../utils/error.utils');
const { catchAsync } = require('../middleware/error.middleware');

const router = express.Router();

/**
 * @desc Serve ID pictures
 * @route GET /api/uploads/id-pictures/:filename
 * @access Private (Only managers and the user who uploaded the picture)
 */
const serveIdPicture = catchAsync(async (req, res, next) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/id-pictures', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return next(new AppError('File not found', 404));
    }

    // Extract user ID from filename (format: userId-timestamp.ext)
    const fileUserId = parseInt(filename.split('-')[0]);

    // Check if user has permission to view this file
    const canView =
        req.user.role === USER_ROLES.MANAGER ||
        req.user.role === USER_ROLES.ADMIN ||
        req.user.id === fileUserId;

    if (!canView) {
        return next(new AppError('Not authorized to view this file', 403));
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour

    // Serve the file
    res.sendFile(filePath);
});

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/id-pictures/:filename', serveIdPicture);

module.exports = router;
