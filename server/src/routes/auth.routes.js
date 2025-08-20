const express = require('express');
const {
    register,
    login,
    logout,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    getApprovalStatus,
    getAvailableBranches,
    uploadIdPicture
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');
const { handleIdPictureUpload, cleanupOnError } = require('../middleware/upload.middleware');
const {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    updateProfileValidation
} = require('../utils/validation.utils');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.get('/branches', getAvailableBranches);

// Protected routes
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, handleValidationErrors, updateProfile);
router.post('/logout', logout);
router.put('/change-password', changePasswordValidation, handleValidationErrors, changePassword);
router.post('/resend-verification', resendVerification);
router.get('/approval-status', getApprovalStatus);
router.post('/upload-id-picture', handleIdPictureUpload, cleanupOnError, uploadIdPicture);

module.exports = router;
