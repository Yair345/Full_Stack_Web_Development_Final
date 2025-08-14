const jwt = require('jsonwebtoken');
const { config } = require('../config/config');

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload
 * @returns {String} JWT token
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: 'bank-app',
        audience: 'bank-app-users'
    });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: 'bank-app',
        audience: 'bank-app-users'
    });
};

/**
 * Verify JWT access token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret, {
            issuer: 'bank-app',
            audience: 'bank-app-users'
        });
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

/**
 * Verify JWT refresh token
 * @param {String} token - JWT refresh token
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.refreshSecret, {
            issuer: 'bank-app',
            audience: 'bank-app-users'
        });
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User object
 * @returns {Object} Token pair
 */
const generateTokenPair = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    };

    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken({ id: user.id }),
        expiresIn: config.jwt.expiresIn
    };
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} JWT token
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};

/**
 * Decode JWT token without verification (for expired tokens)
 * @param {String} token - JWT token
 * @returns {Object|null} Decoded token payload
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateTokenPair,
    extractTokenFromHeader,
    decodeToken
};
