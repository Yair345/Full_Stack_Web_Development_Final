const { User, Branch } = require('../models');
const AuthService = require('../services/auth.service');
const AuditService = require('../services/audit.service');
const { AppError } = require('../utils/error.utils');
const { catchAsync } = require('../middleware/error.middleware');
const { requestLogger: logger } = require('../middleware/logger.middleware');
const { encryptData } = require('../utils/encryption.utils');
const { deleteFile } = require('../middleware/upload.middleware');
const fileService = require('../services/file.service');
const { Op } = require('sequelize');
const path = require('path');

/**
 * @desc Register new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = catchAsync(async (req, res, next) => {
    const { username, email, password, first_name, last_name, phone, date_of_birth, national_id, address, branch_id } = req.body;

    // Log registration attempt to audit logs
    await AuditService.logAuth({
        action: 'registration_attempt',
        req,
        user: null,
        success: false, // Will update on success
        details: {
            email,
            username,
            branch_id,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip
        }
    });

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

    // Log successful registration to audit logs
    await AuditService.logAuth({
        action: 'registration_success',
        req,
        user,
        success: true,
        details: {
            userId: user.id,
            email: user.email,
            username: user.username,
            approvalStatus: user.approval_status,
            pendingBranchId: user.pending_branch_id
        }
    });

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

    // Log login attempt to audit logs
    await AuditService.logAuth({
        action: 'login_attempt',
        req,
        user: null,
        success: false, // Will update on success
        details: {
            email,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip
        }
    });

    try {
        // Login with AuthService
        const { user, tokens } = await AuthService.login({ username: email, password });

        // Update last login
        await user.update({ last_login: new Date() });

        // Log successful login to audit logs
        await AuditService.logAuth({
            action: 'login_success',
            req,
            user,
            success: true,
            details: {
                userId: user.id,
                email: user.email,
                username: user.username,
                lastLogin: user.last_login,
                loginMethod: 'email_password'
            }
        });

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
        // Log failed login attempt to audit logs
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

    // Log logout request to audit logs
    await AuditService.logAuth({
        action: 'logout_requested',
        req,
        user: req.user,
        success: true,
        details: {
            userId,
            logoutMethod: 'manual'
        }
    });

    // Logout with AuthService
    await AuthService.logout(refreshToken, userId);

    // Log successful logout to audit logs
    await AuditService.logAuth({
        action: 'logout_success',
        req,
        user: req.user,
        success: true,
        details: {
            userId,
            logoutMethod: 'manual',
            sessionDuration: req.user.last_login ? Date.now() - new Date(req.user.last_login).getTime() : null
        }
    });

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

    // Log token refresh request to audit logs
    await AuditService.logAuth({
        action: 'token_refresh_requested',
        req,
        user: null,
        success: false, // Will update on success
        details: {
            hasRefreshToken: !!refreshToken,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip
        }
    });

    // Refresh token with AuthService
    const tokens = await AuthService.refreshToken(refreshToken);

    // Log successful token refresh to audit logs
    await AuditService.logAuth({
        action: 'token_refresh_success',
        req,
        user: null, // We don't have user context in token refresh
        success: true,
        details: {
            tokenRefreshed: true,
            newTokenGenerated: !!tokens
        }
    });

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

    // Log profile update request to audit logs
    await AuditService.logAuth({
        action: 'profile_update_requested',
        req,
        user: req.user,
        success: true,
        details: {
            userId,
            fieldsToUpdate: { username: !!username, phone: !!phone, address: !!address },
            currentUsername: req.user.username
        }
    });

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

    // Log successful profile update to audit logs
    await AuditService.logAuth({
        action: 'profile_updated_successfully',
        req,
        user: updatedUser,
        success: true,
        details: {
            userId,
            updatedFields: {
                username: username !== req.user.username ? { from: req.user.username, to: username } : null,
                phone: phone !== req.user.phone ? { from: req.user.phone, to: phone } : null,
                address: address !== req.user.address ? { from: req.user.address, to: address } : null
            }
        }
    });

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

    // Log password change request to audit logs
    await AuditService.logAuth({
        action: 'password_change_requested',
        req,
        user: req.user,
        success: true,
        details: {
            userId,
            hasCurrentPassword: !!currentPassword,
            hasNewPassword: !!newPassword
        }
    });

    // Change password with AuthService
    await AuthService.changePassword(userId, currentPassword, newPassword);

    // Log successful password change to audit logs
    await AuditService.logAuth({
        action: 'password_changed_successfully',
        req,
        user: req.user,
        success: true,
        details: {
            userId,
            passwordChangeMethod: 'authenticated_change'
        }
    });

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

    // Log password reset request to audit logs
    await AuditService.logAuth({
        action: 'password_reset_requested',
        req,
        user: null,
        success: true,
        details: {
            email,
            resetMethod: 'email'
        }
    });

    // Request reset with AuthService
    await AuthService.forgotPassword(email);

    // Log password reset email sent to audit logs
    await AuditService.logAuth({
        action: 'password_reset_email_sent',
        req,
        user: null,
        success: true,
        details: {
            email,
            resetMethod: 'email'
        }
    });

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

    // Log password reset attempt to audit logs
    await AuditService.logAuth({
        action: 'password_reset_attempted',
        req,
        user: null,
        success: false, // Will update on success
        details: {
            hasToken: !!token,
            hasNewPassword: !!newPassword,
            resetMethod: 'token'
        }
    });

    // Reset password with AuthService
    await AuthService.resetPassword(token, newPassword);

    // Log successful password reset to audit logs
    await AuditService.logAuth({
        action: 'password_reset_successfully',
        req,
        user: null,
        success: true,
        details: {
            resetMethod: 'token',
            tokenUsed: true
        }
    });

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

    // Log email verification attempt to audit logs
    await AuditService.logAuth({
        action: 'email_verification_attempted',
        req,
        user: null,
        success: false, // Will update on success
        details: {
            hasToken: !!token,
            verificationMethod: 'email_token'
        }
    });

    // Verify email with AuthService
    const user = await AuthService.verifyEmail(token);

    // Log successful email verification to audit logs
    await AuditService.logAuth({
        action: 'email_verified_successfully',
        req,
        user,
        success: true,
        details: {
            userId: user.id,
            email: user.email,
            verificationMethod: 'email_token',
            verifiedAt: user.email_verified_at
        }
    });

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

    // Log resend verification request to audit logs
    await AuditService.logAuth({
        action: 'resend_verification_requested',
        req,
        user,
        success: true,
        details: {
            userId: user.id,
            email: user.email,
            alreadyVerified: !!user.email_verified_at
        }
    });

    // Resend verification with AuthService
    await AuthService.resendVerification(user.id);

    // Log verification email resent to audit logs
    await AuditService.logAuth({
        action: 'verification_email_resent',
        req,
        user,
        success: true,
        details: {
            userId: user.id,
            email: user.email,
            resentMethod: 'email'
        }
    });

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
    // Log branches request to audit logs
    await AuditService.logAuth({
        action: 'available_branches_requested',
        req,
        user: null,
        success: true,
        details: {
            requestType: 'public_branch_list',
            purpose: 'registration'
        }
    });

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

    if (!req.mongoFile) {
        return next(new AppError('Please select an ID picture to upload', 400));
    }

    // Delete old ID picture if it exists
    if (user.id_picture_path) {
        // Extract filename from the old path and delete from MongoDB
        const oldFilename = user.id_picture_path.split('/').pop();
        await deleteFile(oldFilename);
    }

    // Save the MongoDB filename to user record
    const mongoFilename = req.mongoFile.filename;
    await user.update({
        id_picture_path: `mongodb://${mongoFilename}` // Use a special format to indicate MongoDB storage
    });

    // Log successful ID picture upload to audit logs
    await AuditService.logAuth({
        action: 'id_picture_uploaded_successfully',
        req,
        user,
        success: true,
        details: {
            userId,
            filename: mongoFilename,
            originalName: req.mongoFile.originalname,
            fileSize: req.mongoFile.size,
            storage: 'mongodb',
            purpose: 'identity_verification'
        }
    });

    // Log audit event
    await AuditService.logAuth({
        action: 'upload_id_picture',
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
            filename: mongoFilename,
            originalName: req.mongoFile.originalname,
            size: req.mongoFile.size,
            storage: 'mongodb'
        }
    });

    res.status(200).json({
        success: true,
        message: 'ID picture uploaded successfully to MongoDB',
        data: {
            filename: mongoFilename,
            path: `mongodb://${mongoFilename}`,
            storage: 'mongodb'
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
