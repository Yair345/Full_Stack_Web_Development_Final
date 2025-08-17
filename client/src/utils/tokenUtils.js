/**
 * Utility functions for JWT token handling and validation
 */

/**
 * Decodes a JWT token payload
 * @param {string} token - The JWT token to decode
 * @returns {object|null} The decoded payload or null if invalid
 */
export const decodeToken = (token) => {
    try {
        if (!token || typeof token !== 'string') return null;

        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Checks if a token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;

    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
};

/**
 * Gets the expiration time of a token
 * @param {string} token - The JWT token
 * @returns {number|null} Expiration time in milliseconds or null if invalid
 */
export const getTokenExpiry = (token) => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return null;

    return payload.exp * 1000; // Convert to milliseconds
};

/**
 * Checks if a token will expire within a certain buffer time
 * @param {string} token - The JWT token
 * @param {number} bufferMs - Buffer time in milliseconds (default: 2 minutes)
 * @returns {boolean} True if token is expiring soon
 */
export const isTokenExpiringSoon = (token, bufferMs = 2 * 60 * 1000) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;

    const now = Date.now();
    return (expiry - now) <= bufferMs;
};

/**
 * Gets the remaining time for a token in a human-readable format
 * @param {string} token - The JWT token
 * @returns {string} Time remaining (e.g., "5m 30s", "Expired")
 */
export const getTimeRemaining = (token) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return 'Invalid';

    const now = Date.now();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
};

/**
 * Creates a mock JWT token for testing purposes
 * @param {number} expiryMinutes - Minutes until expiry
 * @returns {string} Mock JWT token
 */
export const createMockToken = (expiryMinutes = 15) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        sub: 'test-user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor((Date.now() + expiryMinutes * 60000) / 1000)
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'mock-signature';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
};
