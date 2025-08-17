/**
 * Token utility functions
 */

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired
 */
export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error parsing token:', error);
        return true;
    }
};

/**
 * Get token expiry time
 * @param {string} token - JWT token
 * @returns {number|null} - Expiry time in milliseconds
 */
export const getTokenExpiry = (token) => {
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000;
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
};

/**
 * Check if token expires soon (within 2 minutes)
 * @param {string} token - JWT token
 * @returns {boolean} - True if expires soon
 */
export const isTokenExpiringSoon = (token) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;

    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000;
    
    return (expiry - now) <= twoMinutes;
};

/**
 * Get time until token expires
 * @param {string} token - JWT token
 * @returns {number} - Time in milliseconds until expiry
 */
export const getTimeUntilExpiry = (token) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return 0;

    return Math.max(0, expiry - Date.now());
};

/**
 * Format time until expiry as human readable string
 * @param {string} token - JWT token
 * @returns {string} - Human readable time
 */
export const getFormattedTimeUntilExpiry = (token) => {
    const timeLeft = getTimeUntilExpiry(token);
    
    if (timeLeft === 0) return 'Expired';
    
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
};
