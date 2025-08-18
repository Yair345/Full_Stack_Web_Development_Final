// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

// Generic fetch wrapper
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Something went wrong');
        }

        return await response.json();
    } catch (error) {
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

    updateProfile: (userData) => apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
    }),

    changePassword: (passwordData) => apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
    }),

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

    // Transfer specific endpoints
    createTransfer: (transferData) => apiRequest('/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify(transferData),
    }),

    createDeposit: (depositData) => apiRequest('/transactions/deposit', {
        method: 'POST',
        body: JSON.stringify(depositData),
    }),

    createWithdrawal: (withdrawalData) => apiRequest('/transactions/withdrawal', {
        method: 'POST',
        body: JSON.stringify(withdrawalData),
    }),

    cancelTransaction: (id) => apiRequest(`/transactions/${id}/cancel`, {
        method: 'PUT',
    }),
};

// Standing Order API calls
export const standingOrderAPI = {
    getStandingOrders: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/standing-orders${queryString ? `?${queryString}` : ''}`);
    },

    getStandingOrder: (id) => apiRequest(`/standing-orders/${id}`),

    createStandingOrder: (orderData) => apiRequest('/standing-orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    }),

    updateStandingOrder: (id, orderData) => apiRequest(`/standing-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orderData),
    }),

    toggleStandingOrderStatus: (id) => apiRequest(`/standing-orders/${id}/toggle`, {
        method: 'PUT',
    }),

    cancelStandingOrder: (id) => apiRequest(`/standing-orders/${id}`, {
        method: 'DELETE',
    }),
};

// Loan API calls
export const loanAPI = {
    getLoans: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/loans${queryString ? `?${queryString}` : ''}`);
    },

    getLoan: (id) => apiRequest(`/loans/${id}`),

    getLoanSummary: () => apiRequest('/loans/summary'),

    createLoanApplication: (loanData) => apiRequest('/loans', {
        method: 'POST',
        body: JSON.stringify(loanData),
    }),

    updateLoanApplication: (id, loanData) => apiRequest(`/loans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(loanData),
    }),

    makeLoanPayment: (id, paymentData) => apiRequest(`/loans/${id}/payment`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
    }),

    calculateLoanPayment: (calculationData) => apiRequest('/loans/calculate', {
        method: 'POST',
        body: JSON.stringify(calculationData),
    }),

    // Admin functions
    updateLoanStatus: (id, statusData) => apiRequest(`/loans/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(statusData),
    }),
};

// Card API calls
export const cardAPI = {
    getCards: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/cards${queryString ? `?${queryString}` : ''}`);
    },

    getCard: (id) => apiRequest(`/cards/${id}`),

    createCard: (cardData) => apiRequest('/cards', {
        method: 'POST',
        body: JSON.stringify(cardData),
    }),

    updateCard: (id, cardData) => apiRequest(`/cards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cardData),
    }),

    toggleCardBlock: (id) => apiRequest(`/cards/${id}/toggle-block`, {
        method: 'PUT',
    }),

    cancelCard: (id) => apiRequest(`/cards/${id}`, {
        method: 'DELETE',
    }),

    changePin: (id, pinData) => apiRequest(`/cards/${id}/change-pin`, {
        method: 'PUT',
        body: JSON.stringify(pinData),
    }),
};

export default { apiRequest, authAPI, accountAPI, transactionAPI, standingOrderAPI, loanAPI, cardAPI };
