const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { USER_ROLES } = require('../utils/constants');
const { AppError } = require('../utils/error.utils');
const { catchAsync } = require('../middleware/error.middleware');
const fileService = require('../services/file.service');

const router = express.Router();

/**
 * @desc Serve ID pictures from MongoDB
 * @route GET /api/uploads/id-pictures/:filename
 * @access Private (Only managers and the user who uploaded the picture)
 */
const serveIdPicture = catchAsync(async (req, res, next) => {
    const { filename } = req.params;

    try {
        // Get file from MongoDB
        const fileData = await fileService.getFile(filename);

        if (!fileData) {
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
        res.setHeader('Content-Type', fileData.metadata.contentType);
        res.setHeader('Content-Length', fileData.metadata.size);
        res.setHeader('Content-Disposition', `inline; filename="${fileData.metadata.originalName}"`);
        res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
        res.setHeader('Last-Modified', fileData.metadata.uploadedAt.toUTCString());

        // Pipe the file stream to response
        fileData.stream.pipe(res);

        // Handle stream errors
        fileData.stream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                next(new AppError('Error streaming file', 500));
            }
        });

    } catch (error) {
        console.error('Error serving file:', error);
        if (error instanceof AppError) {
            return next(error);
        }
        return next(new AppError('Failed to serve file', 500));
    }
});

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/id-pictures/:filename', serveIdPicture);

/**
 * @desc Get user's uploaded files
 * @route GET /api/uploads/my-files
 * @access Private
 */
router.get('/my-files', catchAsync(async (req, res, next) => {
    const { fileType } = req.query;

    try {
        const files = await fileService.getUserFiles(req.user.id, fileType);

        res.status(200).json({
            success: true,
            message: 'Files retrieved successfully',
            data: files
        });
    } catch (error) {
        return next(new AppError('Failed to retrieve files', 500));
    }
}));

/**
 * @desc Delete uploaded file
 * @route DELETE /api/uploads/:filename
 * @access Private (Only file owner, managers, and admins)
 */
router.delete('/:filename', catchAsync(async (req, res, next) => {
    const { filename } = req.params;

    try {
        // Get file metadata to check ownership
        const fileData = await fileService.getFile(filename);

        if (!fileData) {
            return next(new AppError('File not found', 404));
        }

        // Extract user ID from filename
        const fileUserId = parseInt(filename.split('-')[0]);

        // Check permission
        const canDelete =
            req.user.role === USER_ROLES.MANAGER ||
            req.user.role === USER_ROLES.ADMIN ||
            req.user.id === fileUserId;

        if (!canDelete) {
            return next(new AppError('Not authorized to delete this file', 403));
        }

        await fileService.deleteFile(filename);

        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting file:', error);
        return next(new AppError('Failed to delete file', 500));
    }
}));

/**
 * @desc Get file storage statistics (Admin only)
 * @route GET /api/uploads/stats
 * @access Private (Admin only)
 */
router.get('/stats', requireRole([USER_ROLES.ADMIN]), catchAsync(async (req, res, next) => {
    try {
        const stats = await fileService.getFileStats();

        res.status(200).json({
            success: true,
            message: 'File statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        return next(new AppError('Failed to retrieve file statistics', 500));
    }
}));

module.exports = router;
