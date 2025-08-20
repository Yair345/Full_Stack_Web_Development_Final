const { User, Branch } = require('../models');
const AuthService = require('../services/auth.service');
const AuditService = require('../services/audit.service');
const { AppError } = require('../utils/error.utils');
const { catchAsync } = require('../middleware/error.middleware');
const { requestLogger: logger } = require('../middleware/logger.middleware');
const { encryptData } = require('../utils/encryption.utils');
const { deleteFile } = require('../middleware/upload.middleware');
const { Op } = require('sequelize');
const path = require('path');

/**
 * @desc Register new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = catchAsync(async (req, res, next) => {
    const { username, email, password, first_name, last_name, phone, date_of_birth, national_id, address, branch_id } = req.body;

    logger.info(`Registration attempt for email: ${email}`);

    // Check if user already exists - check each field separately for specific error messages
    const existingEmailUser = await User.findOne({ where: { email } });
    const existingUsernameUser = await User.findOne({ where: { username } });
    const existingNationalIdUser = await User.findOne({ where: { national_id } });

    if (existingEmailUser || existingUsernameUser || existingNationalIdUser) {
        // Create field-specific error response similar to validation middleware
        const errors = [];

        if (existingEmailUser) {
            errors.push({
                field: 'email',
                message: 'An account with this email already exists',
                value: email
            });
        }
        if (existingUsernameUser) {
            errors.push({
                field: 'username',
                message: 'This username is already taken',
                value: username
            });
        }
        if (existingNationalIdUser) {
            errors.push({
                field: 'national_id',
                message: 'An account with this National ID already exists',
                value: national_id
            });
        }

        return res.status(400).json({
            success: false,
            message: 'User already exists',
            errors: errors
        });
    }

    // Validate that the branch exists if provided
    if (branch_id) {
        const branch = await Branch.findOne({
            where: {
                id: branch_id,
                is_active: true
            }
        });

        if (!branch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid branch selected',
                errors: [{
                    field: 'branch_id',
                    message: 'Selected branch does not exist or is not active',
                    value: branch_id
                }]
            });
        }
    }

    // Create user with AuthService - they will be in pending status
    const { user, tokens } = await AuthService.register({
        username,
        email,
        password,
        first_name,
        last_name,
        phone,
        date_of_birth,
        national_id,
        address,
        // Set approval status and pending branch
        approval_status: 'pending',
        pending_branch_id: branch_id || null,
        branch_id: null // User gets no branch until approved
    });

    logger.info(`User registered successfully with pending status: ${user.id}`);

    // Log audit event to MongoDB
    await AuditService.logAuth({
        action: 'register',
        req,
        user,
        success: true,
        details: {
            registrationMethod: 'email',
            userRole: user.role,
            approvalStatus: 'pending',
            pendingBranchId: branch_id
        }
    });

    res.status(201).json({
        success: true,
        message: 'Registration successful. Your account is pending approval by the branch manager.',
        data: {
            user: user.toSafeJSON(),
            tokens,
            approval_status: 'pending'
        }
    });
});

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);

    try {
        // Login with AuthService
        const { user, tokens } = await AuthService.login({ username: email, password });

        // Update last login
        await user.update({ last_login: new Date() });

        logger.info(`User logged in successfully: ${user.id}`);

        // Log successful login audit event to MongoDB
        await AuditService.logAuth({
            action: 'login',
            req,
            user,
            success: true,
            details: {
                loginMethod: 'email_password',
                previousLoginAt: user.last_login
            }
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toSafeJSON(),
                tokens
            }
        });
    } catch (error) {
        // Log failed login attempt to MongoDB
        await AuditService.logAuth({
            action: 'login_failed',
            req,
            user: null,
            success: false,
            details: {
                attemptedEmail: email,
                errorMessage: error.message,
                loginMethod: 'email_password'
            }
        });

        // Re-throw the error to be handled by error middleware
        throw error;
    }
});

/**
 * @desc Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;
    const userId = req.user.id;

    logger.info(`Logout request for user: ${userId}`);

    // Logout with AuthService
    await AuthService.logout(refreshToken, userId);

    logger.info(`User logged out successfully: ${userId}`);

    // Log logout audit event to MongoDB
    await AuditService.logAuth({
        action: 'logout',
        req,
        user: req.user,
        success: true,
        details: {
            logoutMethod: 'manual',
            sessionDuration: req.user.last_login ? Date.now() - new Date(req.user.last_login).getTime() : null
        }
    });

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
const refreshToken = catchAsync(async (req, res, next) => {
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
const getProfile = catchAsync(async (req, res, next) => {
    const user = req.user;

    res.json({
        success: true,
        data: {
            user: user.toSafeJSON()
        }
    });
});

/**
 * @desc Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = catchAsync(async (req, res, next) => {
    const { username, phone, address } = req.body;
    const userId = req.user.id;

    logger.info(`Profile update request for user: ${userId}`);

    // Check if username is taken by another user
    if (username && username !== req.user.username) {
        const existingUser = await User.findOne({
            where: { username, id: { [Op.ne]: userId } }
        });

        if (existingUser) {
            throw new AppError('Username is already taken', 400);
        }
    }

    // Update user
    const updatedUser = await req.user.update({
        username: username || req.user.username,
        phone: phone || req.user.phone,
        address: address || req.user.address
    });

    logger.info(`Profile updated successfully for user: ${userId}`);

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user: updatedUser.toSafeJSON()
        }
    });
});

/**
 * @desc Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = catchAsync(async (req, res, next) => {
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
const forgotPassword = catchAsync(async (req, res, next) => {
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
const resetPassword = catchAsync(async (req, res, next) => {
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
const verifyEmail = catchAsync(async (req, res, next) => {
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
const resendVerification = catchAsync(async (req, res, next) => {
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

/**
 * @desc Get available branches for registration
 * @route GET /api/auth/branches
 * @access Public
 */
const getAvailableBranches = catchAsync(async (req, res, next) => {
    logger.info('Getting available branches for registration');

    const branches = await Branch.findAll({
        where: { is_active: true },
        attributes: ['id', 'branch_name', 'city', 'state', 'address'],
        order: [['branch_name', 'ASC']]
    });

    res.json({
        success: true,
        data: { branches }
    });
});

/**
 * @desc Check approval status for current user
 * @route GET /api/auth/approval-status
 * @access Private
 */
const getApprovalStatus = catchAsync(async (req, res, next) => {
    const user = req.user;

    res.json({
        success: true,
        data: {
            approval_status: user.approval_status,
            approved_at: user.approved_at,
            rejection_reason: user.rejection_reason,
            branch_id: user.branch_id,
            pending_branch_id: user.pending_branch_id
        }
    });
});

/**
 * @desc Upload ID picture for pending user
 * @route POST /api/auth/upload-id-picture
 * @access Private (Pending Users Only)
 */
const uploadIdPicture = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    // Check if user is pending approval
    const user = await User.findByPk(userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    if (user.approval_status !== 'pending') {
        return next(new AppError('ID picture can only be uploaded for pending users', 400));
    }

    if (!req.file) {
        return next(new AppError('Please select an ID picture to upload', 400));
    }

    // Delete old ID picture if it exists
    if (user.id_picture_path) {
        const oldPicturePath = path.join(__dirname, '../../uploads/id-pictures', path.basename(user.id_picture_path));
        deleteFile(oldPicturePath);
    }

    // Save the file path to user record
    const relativePath = `uploads/id-pictures/${req.file.filename}`;
    await user.update({
        id_picture_path: relativePath
    });

    logger.info(`ID picture uploaded successfully for user: ${userId}`);

    // Log audit event
    await AuditService.logAuth({
        action: 'upload_id_picture',
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        }
    });

    res.status(200).json({
        success: true,
        message: 'ID picture uploaded successfully',
        data: {
            filename: req.file.filename,
            path: relativePath
        }
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
    resendVerification,
    getApprovalStatus,
    getAvailableBranches,
    uploadIdPicture
};
