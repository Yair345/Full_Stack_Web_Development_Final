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
    resendVerification
} = require('../controllers/auth.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');
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

// Protected routes
router.use(authenticateUser);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, handleValidationErrors, updateProfile);
router.post('/logout', logout);
router.put('/change-password', changePasswordValidation, handleValidationErrors, changePassword);
router.post('/resend-verification', resendVerification);

module.exports = router;
