const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { config } = require('../config/config');

/**
 * Hash password using bcrypt
 * @param {String} password - Plain text password
 * @returns {Promise<String>} Hashed password
 */
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {String} password - Plain text password
 * @param {String} hash - Hashed password
 * @returns {Promise<Boolean>} Match result
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Generate random string
 * @param {Number} length - String length
 * @returns {String} Random string
 */
const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate reset token
 * @returns {String} Reset token
 */
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Encrypt sensitive data
 * @param {String} text - Text to encrypt
 * @returns {String} Encrypted text
 */
const encrypt = (text) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(config.encryption.key, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt sensitive data
 * @param {String} encryptedText - Encrypted text
 * @returns {String} Decrypted text
 */
const decrypt = (encryptedText) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(config.encryption.key, 'salt', 32);

    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');

    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

/**
 * Generate account number
 * @returns {String} Account number
 */
const generateAccountNumber = () => {
    const prefix = '1001'; // Bank identifier
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return prefix + random;
};

/**
 * Generate transaction reference
 * @returns {String} Transaction reference
 */
const generateTransactionRef = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return 'TXN' + timestamp + random;
};

/**
 * Generate card number
 * @returns {String} Card number
 */
const generateCardNumber = () => {
    const prefix = '4'; // Visa prefix
    const random = Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
    return prefix + random;
};

/**
 * Generate CVV
 * @returns {String} CVV
 */
const generateCVV = () => {
    return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};

/**
 * Mask sensitive data for logging
 * @param {String} data - Data to mask
 * @param {Number} visibleChars - Number of visible characters at start/end
 * @returns {String} Masked data
 */
const maskSensitiveData = (data, visibleChars = 4) => {
    if (!data || data.length <= visibleChars * 2) {
        return '*'.repeat(data?.length || 0);
    }

    const start = data.substring(0, visibleChars);
    const end = data.substring(data.length - visibleChars);
    const middle = '*'.repeat(data.length - (visibleChars * 2));

    return start + middle + end;
};

module.exports = {
    hashPassword,
    comparePassword,
    generateRandomString,
    generateResetToken,
    encrypt,
    decrypt,
    generateAccountNumber,
    generateTransactionRef,
    generateCardNumber,
    generateCVV,
    maskSensitiveData
};
