const multer = require('multer');
const path = require('path');
const { AppError } = require('../utils/error.utils');
const fileService = require('../services/file.service');

// Use memory storage instead of disk storage for MongoDB upload
const memoryStorage = multer.memoryStorage();

// File filter for ID pictures (only jpg, jpeg allowed)
const idPictureFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg'];
    const allowedExtensions = ['.jpg', '.jpeg'];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new AppError('Only JPG and JPEG image files are allowed for ID pictures', 400), false);
    }
};

// Multer configuration for ID pictures
const uploadIdPicture = multer({
    storage: memoryStorage,
    fileFilter: idPictureFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file at a time
    }
}).single('idPicture'); // Field name will be 'idPicture'

// Middleware wrapper to handle multer errors and store in MongoDB
const handleIdPictureUpload = (req, res, next) => {
    uploadIdPicture(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError('File size too large. Maximum size is 5MB', 400));
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return next(new AppError('Too many files. Only one file is allowed', 400));
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return next(new AppError('Unexpected field name. Use "idPicture" as field name', 400));
            }
            return next(new AppError(`Upload error: ${err.message}`, 400));
        } else if (err) {
            return next(err);
        }

        // If file was uploaded, store it in MongoDB
        if (req.file) {
            try {
                // Generate unique filename
                const userId = req.user?.id || 'anonymous';
                const timestamp = Date.now();
                const extension = path.extname(req.file.originalname);
                const filename = `${userId}-${timestamp}${extension}`;

                // Store file in MongoDB
                const result = await fileService.storeFile(req.file.buffer, {
                    filename,
                    originalName: req.file.originalname,
                    contentType: req.file.mimetype,
                    uploadedBy: userId,
                    fileType: 'id-picture'
                });

                // Attach MongoDB file info to request
                req.mongoFile = {
                    filename: result.filename,
                    fileId: result.fileId,
                    gridFSFileId: result.gridFSFileId,
                    size: result.size,
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype
                };

                // Remove the buffer from memory as it's now stored in MongoDB
                delete req.file.buffer;

            } catch (mongoError) {
                console.error('MongoDB storage error:', mongoError);
                return next(new AppError('Failed to store file in database', 500));
            }
        }

        next();
    });
};

// Utility function to delete uploaded file from MongoDB
const deleteFile = async (filename) => {
    try {
        await fileService.deleteFile(filename);
    } catch (error) {
        console.error('Error deleting file from MongoDB:', error);
    }
};

// Middleware to clean up uploaded file on error
const cleanupOnError = (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (data) {
        if (res.statusCode >= 400 && req.mongoFile) {
            deleteFile(req.mongoFile.filename);
        }
        originalSend.call(this, data);
    };

    res.json = function (data) {
        if (res.statusCode >= 400 && req.mongoFile) {
            deleteFile(req.mongoFile.filename);
        }
        originalJson.call(this, data);
    };

    next();
};

module.exports = {
    handleIdPictureUpload,
    cleanupOnError,
    deleteFile
};
