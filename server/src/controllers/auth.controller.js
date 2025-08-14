const { User } = require('../models');
const { AuthService } = require('../services');
const { AppError } = require('../utils/error.utils');
const { asyncHandler } = require('../middleware/error.middleware');
const { logger } = require('../utils/logger');
const { encryptData } = require('../utils/encryption.utils');

/**
 * @desc Register new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res, next) => {
    const { username, email, password, phone_number, date_of_birth, address } = req.body;

    logger.info(`Registration attempt for email: ${email}`);

    // Check if user already exists
    const existingUser = await User.findOne({
        where: {
            $or: [
                { email },
                { username }
            ]
        }
    });

    if (existingUser) {
        throw new AppError('User with this email or username already exists', 400);
    }

    // Create user with AuthService
    const { user, tokens } = await AuthService.register({
        username,
        email,
        password,
        phone_number,
        date_of_birth,
        address
    });

    logger.info(`User registered successfully: ${user.id}`);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
                created_at: user.created_at
            },
            tokens
        }
    });
});

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);

    // Login with AuthService
    const { user, tokens } = await AuthService.login(email, password);

    // Update last login
    await user.update({ last_login_at: new Date() });

    logger.info(`User logged in successfully: ${user.id}`);

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
                last_login_at: user.last_login_at
            },
            tokens
        }
    });
});

/**
 * @desc Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;
    const userId = req.user.id;

    logger.info(`Logout request for user: ${userId}`);

    // Logout with AuthService
    await AuthService.logout(refreshToken, userId);

    logger.info(`User logged out successfully: ${userId}`);

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

/**
 * @desc Refresh access token
 * @route POST /api/auth/refresh
 * @access Public
 */
const refreshToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
    }

    logger.info('Token refresh request');

    // Refresh token with AuthService
    const tokens = await AuthService.refreshToken(refreshToken);

    logger.info('Token refreshed successfully');

    res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens }
    });
});

/**
 * @desc Get current user profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getProfile = asyncHandler(async (req, res, next) => {
    const user = req.user;

    res.json({
        success: true,
        data: {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone_number: user.phone_number,
                date_of_birth: user.date_of_birth,
                address: user.address,
                role: user.role,
                is_active: user.is_active,
                email_verified_at: user.email_verified_at,
                created_at: user.created_at,
                updated_at: user.updated_at,
                last_login_at: user.last_login_at
            }
        }
    });
});

/**
 * @desc Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res, next) => {
    const { username, phone_number, address } = req.body;
    const userId = req.user.id;

    logger.info(`Profile update request for user: ${userId}`);

    // Check if username is taken by another user
    if (username && username !== req.user.username) {
        const existingUser = await User.findOne({
            where: { username, id: { $ne: userId } }
        });

        if (existingUser) {
            throw new AppError('Username is already taken', 400);
        }
    }

    // Update user
    const updatedUser = await req.user.update({
        username: username || req.user.username,
        phone_number: phone_number || req.user.phone_number,
        address: address || req.user.address
    });

    logger.info(`Profile updated successfully for user: ${userId}`);

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                phone_number: updatedUser.phone_number,
                address: updatedUser.address,
                updated_at: updatedUser.updated_at
            }
        }
    });
});

/**
 * @desc Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    logger.info(`Password change request for user: ${userId}`);

    // Change password with AuthService
    await AuthService.changePassword(userId, currentPassword, newPassword);

    logger.info(`Password changed successfully for user: ${userId}`);

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

/**
 * @desc Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    logger.info(`Password reset request for email: ${email}`);

    // Request reset with AuthService
    await AuthService.forgotPassword(email);

    logger.info(`Password reset email sent to: ${email}`);

    res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
    });
});

/**
 * @desc Reset password
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
    const { token, newPassword } = req.body;

    logger.info('Password reset attempt');

    // Reset password with AuthService
    await AuthService.resetPassword(token, newPassword);

    logger.info('Password reset successfully');

    res.json({
        success: true,
        message: 'Password reset successfully'
    });
});

/**
 * @desc Verify email
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
const verifyEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;

    logger.info('Email verification attempt');

    // Verify email with AuthService
    const user = await AuthService.verifyEmail(token);

    logger.info(`Email verified successfully for user: ${user.id}`);

    res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
            user: {
                id: user.id,
                email: user.email,
                email_verified_at: user.email_verified_at
            }
        }
    });
});

/**
 * @desc Resend email verification
 * @route POST /api/auth/resend-verification
 * @access Private
 */
const resendVerification = asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (user.email_verified_at) {
        throw new AppError('Email is already verified', 400);
    }

    logger.info(`Resend verification request for user: ${user.id}`);

    // Resend verification with AuthService
    await AuthService.resendVerification(user.id);

    logger.info(`Verification email resent to user: ${user.id}`);

    res.json({
        success: true,
        message: 'Verification email sent'
    });
});

module.exports = {
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
};
