const bcrypt = require('bcrypt');
const { User } = require('../models');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt.utils');
const { generateResetToken, generateRandomString } = require('../utils/encryption.utils');
const { AppError } = require('../middleware/error.middleware');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');
const { Op } = require('sequelize');
// const emailService = require('./email.service'); // Temporarily disabled

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Object} User and tokens
     */
    static async register(userData) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: userData.email },
                        { username: userData.username },
                        { national_id: userData.national_id }
                    ]
                }
            });

            if (existingUser) {
                if (existingUser.email === userData.email) {
                    throw new AppError('Email already registered', HTTP_STATUS.CONFLICT);
                }
                if (existingUser.username === userData.username) {
                    throw new AppError('Username already taken', HTTP_STATUS.CONFLICT);
                }
                if (existingUser.national_id === userData.national_id) {
                    throw new AppError('National ID already registered', HTTP_STATUS.CONFLICT);
                }
            }

            // Generate email verification token
            const verificationToken = generateRandomString(32);
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Create user
            const user = await User.create({
                ...userData,
                email_verification_token: verificationToken,
                email_verification_expires: verificationExpires
            });

            // Generate JWT tokens
            const tokens = generateTokenPair(user);

            // Send verification email
            try {
                // await emailService.sendVerificationEmail(user, verificationToken); // Temporarily disabled
                console.log(`📧 Verification email would be sent to: ${user.email}`);
                console.log(`📧 Verification token: ${verificationToken}`);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError.message);
                // Don't fail registration if email fails
            }

            return {
                user: user, // Return the actual Sequelize instance
                tokens,
                message: SUCCESS_MESSAGES.USER_CREATED
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Registration failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Authenticate user login
     * @param {Object} credentials - Login credentials
     * @returns {Object} User and tokens
     */
    static async login({ username, password }) {
        try {
            // Find user by username or email
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { email: username }
                    ]
                }
            });

            if (!user) {
                throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
            }

            // Check if account is active
            if (!user.is_active) {
                throw new AppError(ERROR_MESSAGES.USER_INACTIVE, HTTP_STATUS.UNAUTHORIZED);
            }

            // Check if account is locked
            if (user.locked_until && new Date() < user.locked_until) {
                const lockTime = Math.ceil((user.locked_until - new Date()) / 60000);
                throw new AppError(
                    `Account temporarily locked. Try again in ${lockTime} minutes`,
                    HTTP_STATUS.UNAUTHORIZED
                );
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                // Increment failed login attempts
                const attempts = user.login_attempts + 1;
                const updateData = { login_attempts: attempts };

                // Lock account after 5 failed attempts
                if (attempts >= 5) {
                    updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                }

                await user.update(updateData);
                throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
            }

            // Reset login attempts on successful login
            await user.update({
                login_attempts: 0,
                locked_until: null,
                last_login: new Date()
            });

            // Generate JWT tokens
            const tokens = generateTokenPair(user);

            return {
                user: user, // Return the actual Sequelize instance
                tokens,
                message: SUCCESS_MESSAGES.LOGIN_SUCCESS
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Login failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Refresh JWT tokens using refresh token
     * @param {String} refreshToken - Refresh token
     * @returns {Object} New tokens
     */
    static async refreshToken(refreshToken) {
        try {
            // Verify the refresh token
            const decoded = verifyRefreshToken(refreshToken);

            // Get user from database
            const user = await User.findByPk(decoded.id);

            if (!user) {
                throw new AppError('User not found', HTTP_STATUS.UNAUTHORIZED);
            }

            if (!user.is_active) {
                throw new AppError('User account is inactive', HTTP_STATUS.UNAUTHORIZED);
            }

            // Generate new token pair
            const tokens = generateTokenPair(user);

            return {
                tokens,
                message: 'Tokens refreshed successfully'
            };
        } catch (error) {
            if (error.message.includes('Invalid or expired')) {
                throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
            }
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Token refresh failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Refresh JWT tokens
     * @param {Object} user - User object from refresh token
     * @returns {Object} New tokens
     */
    static async refreshTokens(user) {
        try {
            // Generate new token pair
            const tokens = generateTokenPair(user);

            return {
                tokens,
                message: 'Tokens refreshed successfully'
            };
        } catch (error) {
            throw new AppError('Token refresh failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Send password reset email
     * @param {String} email - User email
     * @returns {Object} Success message
     */
    static async forgotPassword(email) {
        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                // Don't reveal if email exists
                return {
                    message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT
                };
            }

            // Generate reset token
            const resetToken = generateResetToken();
            const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            // Save reset token
            await user.update({
                reset_token: resetToken,
                reset_token_expires: resetExpires
            });

            // Send reset email
            try {
                // await emailService.sendPasswordResetEmail(user, resetToken); // Temporarily disabled
                console.log(`📧 Password reset email would be sent to: ${user.email}`);
                console.log(`📧 Reset token: ${resetToken}`);
            } catch (emailError) {
                console.error('Failed to send password reset email:', emailError.message);
                throw new AppError('Failed to send password reset email', HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }

            return {
                message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Password reset request failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Reset password with token
     * @param {String} token - Reset token
     * @param {String} newPassword - New password
     * @returns {Object} Success message
     */
    static async resetPassword(token, newPassword) {
        try {
            const user = await User.findOne({
                where: {
                    reset_token: token,
                    reset_token_expires: {
                        [Op.gt]: new Date()
                    }
                }
            });

            if (!user) {
                throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
            }

            // Update password and clear reset token
            await user.update({
                password: newPassword, // Will be hashed by model hook
                reset_token: null,
                reset_token_expires: null,
                login_attempts: 0,
                locked_until: null
            });

            return {
                message: SUCCESS_MESSAGES.PASSWORD_CHANGED
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Password reset failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Verify email address
     * @param {String} token - Verification token
     * @returns {Object} Success message
     */
    static async verifyEmail(token) {
        try {
            const user = await User.findOne({
                where: {
                    email_verification_token: token,
                    email_verification_expires: {
                        [Op.gt]: new Date()
                    }
                }
            });

            if (!user) {
                throw new AppError('Invalid or expired verification token', HTTP_STATUS.BAD_REQUEST);
            }

            // Mark email as verified
            await user.update({
                is_verified: true,
                email_verification_token: null,
                email_verification_expires: null
            });

            return {
                message: SUCCESS_MESSAGES.EMAIL_VERIFIED
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Email verification failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Change user password
     * @param {Object} user - Current user
     * @param {String} currentPassword - Current password
     * @param {String} newPassword - New password
     * @returns {Object} Success message
     */
    static async changePassword(user, currentPassword, newPassword) {
        try {
            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);

            if (!isValidPassword) {
                throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
            }

            // Update password
            await user.update({
                password: newPassword // Will be hashed by model hook
            });

            return {
                message: SUCCESS_MESSAGES.PASSWORD_CHANGED
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Password change failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Resend verification email
     * @param {String} email - User email
     * @returns {Object} Success message
     */
    static async resendVerification(email) {
        try {
            const user = await User.findOne({
                where: {
                    email,
                    is_verified: false
                }
            });

            if (!user) {
                throw new AppError('User not found or already verified', HTTP_STATUS.BAD_REQUEST);
            }

            // Generate new verification token
            const verificationToken = generateRandomString(32);
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            await user.update({
                email_verification_token: verificationToken,
                email_verification_expires: verificationExpires
            });

            // Send verification email
            try {
                // await emailService.sendVerificationEmail(user, verificationToken); // Temporarily disabled
                console.log(`📧 Verification email would be sent to: ${user.email}`);
                console.log(`📧 Verification token: ${verificationToken}`);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError.message);
                throw new AppError('Failed to send verification email', HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }

            return {
                message: 'Verification email sent successfully'
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Failed to resend verification email', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Logout user (invalidate tokens - would require token blacklist in production)
     * @param {Object} user - User object
     * @returns {Object} Success message
     */
    static async logout(user) {
        try {
            // In a production environment, you would add the token to a blacklist
            // For now, we'll just return a success message

            return {
                message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
            };
        } catch (error) {
            throw new AppError('Logout failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = AuthService;
