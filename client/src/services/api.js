// API configuration
// API Base URL
const API_BASE_URL = 'http://localhost:5006/api/v1';

// Track if we're currently refreshing token to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Token refresh failed');
        }

        const data = await response.json();
        
        // Update tokens in localStorage
        localStorage.setItem('token', data.accessToken);
        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }

        return data.accessToken;
    } catch (error) {
        // Clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw error;
    }
};

// Generic fetch wrapper with automatic token refresh
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const makeRequest = async (token) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Something went wrong');
        }

        return await response.json();
    };

    try {
        const token = localStorage.getItem('token');
        return await makeRequest(token);
    } catch (error) {
        // If token expired, try to refresh and retry the request
        if (error.message.includes('expired') || error.message.includes('unauthorized')) {
            if (isRefreshing) {
                // If already refreshing, wait for it to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    return makeRequest(token);
                }).catch(err => {
                    throw err;
                });
            }

            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                processQueue(null, newToken);
                isRefreshing = false;
                
                // Retry the original request with new token
                return await makeRequest(newToken);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                throw refreshError;
            }
        }

        // Don't log AbortErrors as they are expected during cleanup
        if (error.name !== 'AbortError') {
            console.error('API request failed:', error);
        }
        throw error;
    }
};

// Auth API calls
export const authAPI = {
    login: (credentials) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),

    register: (userData) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    refreshToken: () => apiRequest('/auth/refresh', {
        method: 'POST',
    }),

    logout: () => apiRequest('/auth/logout', {
        method: 'POST',
    }),

    getProfile: () => apiRequest('/auth/profile'),

    validateToken: () => apiRequest('/auth/validate'),
};

// Account API calls
export const accountAPI = {
    getAccounts: () => apiRequest('/accounts'),

    getAccount: (id) => apiRequest(`/accounts/${id}`),

    createAccount: (accountData) => apiRequest('/accounts', {
        method: 'POST',
        body: JSON.stringify(accountData),
    }),

    updateAccount: (id, accountData) => apiRequest(`/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(accountData),
    }),
};

// Transaction API calls
export const transactionAPI = {
    getTransactions: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
    },

    getTransactionSummary: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/transactions/summary${queryString ? `?${queryString}` : ''}`);
    },

    createTransaction: (transactionData) => apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData),
    }),

    getTransaction: (id) => apiRequest(`/transactions/${id}`),
};

export default { apiRequest, authAPI, accountAPI, transactionAPI };
