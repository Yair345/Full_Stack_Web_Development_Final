// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

// Generic fetch wrapper
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = sessionStorage.getItem('token');

    const config = {
        headers: {
            ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
            ...options.headers,
            ...(token && { Authorization: `Bearer ${token}` }), // Keep Authorization last to avoid override
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

    getApprovalStatus: () => apiRequest('/auth/approval-status'),

    getBranches: () => apiRequest('/auth/branches'),

    uploadIdPicture: (formData) => apiRequest('/auth/upload-id-picture', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with the boundary for FormData
    }),

    getUserFiles: (fileType) => {
        const queryString = fileType ? `?fileType=${fileType}` : '';
        return apiRequest(`/uploads/my-files${queryString}`);
    },
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

    deleteAccount: (id) => apiRequest(`/accounts/${id}`, {
        method: 'DELETE',
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

    // Branch manager functions
    approveBranchLoan: (id, approvalData) => apiRequest(`/loans/${id}/branch-approval`, {
        method: 'PUT',
        body: JSON.stringify(approvalData),
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

// Stock API calls
export const stockAPI = {
    // Get available stocks for trading
    getAvailableStocks: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/stocks${queryString ? `?${queryString}` : ''}`);
    },

    // Search stocks by symbol or name
    searchStocks: (query) => apiRequest(`/stocks/search?q=${encodeURIComponent(query)}`),

    // Buy stock
    buyStock: (orderData) => apiRequest('/stocks/buy', {
        method: 'POST',
        body: JSON.stringify(orderData),
    }),

    // Sell stock
    sellStock: (orderData) => apiRequest('/stocks/sell', {
        method: 'POST',
        body: JSON.stringify(orderData),
    }),

    // Get user's stock transactions
    getStockTransactions: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/stocks/transactions${queryString ? `?${queryString}` : ''}`);
    },

    // Get user's portfolio
    getPortfolio: (updatePrices = true) => {
        const params = updatePrices ? '?updatePrices=true' : '?updatePrices=false';
        return apiRequest(`/stocks/portfolio${params}`);
    },

    // Get user's watchlist
    getWatchlist: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/stocks/watchlist${queryString ? `?${queryString}` : ''}`);
    },

    // Add stock to watchlist
    addToWatchlist: (watchlistData) => apiRequest('/stocks/watchlist', {
        method: 'POST',
        body: JSON.stringify(watchlistData),
    }),

    // Remove stock from watchlist
    removeFromWatchlist: (id) => apiRequest(`/stocks/watchlist/${id}`, {
        method: 'DELETE',
    }),

    // Update portfolio and watchlist prices
    updatePrices: () => apiRequest('/stocks/update-prices', {
        method: 'POST',
    }),
};

// Branch API calls
export const branchAPI = {
    // Get all branches
    getBranches: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/branches${queryString ? `?${queryString}` : ''}`);
    },

    // Get branch by ID
    getBranch: (id) => apiRequest(`/branches/${id}`),

    // Create new branch
    createBranch: (branchData) => apiRequest('/branches', {
        method: 'POST',
        body: JSON.stringify(branchData),
    }),

    // Update branch
    updateBranch: (id, branchData) => apiRequest(`/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(branchData),
    }),

    // Delete branch
    deleteBranch: (id) => apiRequest(`/branches/${id}`, {
        method: 'DELETE',
    }),

    // Get branch customers
    getBranchCustomers: (id, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/branches/${id}/customers${queryString ? `?${queryString}` : ''}`);
    },

    // Get branch loan applications
    getBranchLoans: (id, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/branches/${id}/loans${queryString ? `?${queryString}` : ''}`);
    },

    // Get branch performance metrics
    getBranchPerformance: (id, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/branches/${id}/performance${queryString ? `?${queryString}` : ''}`);
    },

    // Get pending users for branch approval
    getPendingUsers: (id) => apiRequest(`/branches/${id}/pending-users`),

    // Approve a user for branch membership
    approveUser: (branchId, userId) => apiRequest(`/branches/${branchId}/approve-user/${userId}`, {
        method: 'PUT',
    }),

    // Reject a user's branch membership request
    rejectUser: (branchId, userId, reason) => apiRequest(`/branches/${branchId}/reject-user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
    }),

    // Create branch deposit to customer account
    createBranchDeposit: (branchId, depositData) => apiRequest(`/branches/${branchId}/deposit`, {
        method: 'POST',
        body: JSON.stringify(depositData),
    }),
};

export default { apiRequest, authAPI, accountAPI, transactionAPI, standingOrderAPI, loanAPI, cardAPI, stockAPI, branchAPI };
