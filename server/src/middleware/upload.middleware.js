const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/error.utils');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const idPicturesDir = path.join(uploadsDir, 'id-pictures');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(idPicturesDir)) {
    fs.mkdirSync(idPicturesDir, { recursive: true });
}

// Storage configuration for ID pictures
const idPictureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, idPicturesDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: userId-timestamp.extension
        const userId = req.user?.id || 'anonymous';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const filename = `${userId}-${timestamp}${extension}`;
        cb(null, filename);
    }
});

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
    storage: idPictureStorage,
    fileFilter: idPictureFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file at a time
    }
}).single('idPicture'); // Field name will be 'idPicture'

// Middleware wrapper to handle multer errors
const handleIdPictureUpload = (req, res, next) => {
    uploadIdPicture(req, res, (err) => {
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
        next();
    });
};

// Utility function to delete uploaded file
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// Middleware to clean up uploaded file on error
const cleanupOnError = (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (data) {
        if (res.statusCode >= 400 && req.file) {
            deleteFile(req.file.path);
        }
        originalSend.call(this, data);
    };

    res.json = function (data) {
        if (res.statusCode >= 400 && req.file) {
            deleteFile(req.file.path);
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
