import { apiRequest } from './api';

class BranchService {
    // Get branch customers
    async getBranchCustomers(branchId, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = `/branches/${branchId}/customers${queryString ? `?${queryString}` : ''}`;
            const response = await apiRequest(endpoint);
            return response;
        } catch (error) {
            console.error('Error fetching branch customers:', error);
            throw error;
        }
    }

    // Get specific customer details for branch
    async getBranchCustomerById(branchId, userId) {
        try {
            const response = await apiRequest(`/branches/${branchId}/customers/${userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching branch customer:', error);
            throw error;
        }
    }

    // Update customer information (limited fields for branch managers)
    async updateBranchCustomer(branchId, userId, userData) {
        try {
            const response = await apiRequest(`/branches/${branchId}/customers/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
            return response;
        } catch (error) {
            console.error('Error updating branch customer:', error);
            throw error;
        }
    }

    // Get branch loans
    async getBranchLoans(branchId, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = `/branches/${branchId}/loans${queryString ? `?${queryString}` : ''}`;
            const response = await apiRequest(endpoint);
            return response;
        } catch (error) {
            console.error('Error fetching branch loans:', error);
            throw error;
        }
    }

    // Get branch performance metrics
    async getBranchPerformance(branchId, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = `/branches/${branchId}/performance${queryString ? `?${queryString}` : ''}`;
            const response = await apiRequest(endpoint);
            return response;
        } catch (error) {
            console.error('Error fetching branch performance:', error);
            throw error;
        }
    }

    // Get pending users for branch approval
    async getPendingUsers(branchId, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = `/branches/${branchId}/pending-users${queryString ? `?${queryString}` : ''}`;
            const response = await apiRequest(endpoint);
            return response;
        } catch (error) {
            console.error('Error fetching pending users:', error);
            throw error;
        }
    }

    // Approve user for branch membership
    async approveUser(branchId, userId) {
        try {
            const response = await apiRequest(`/branches/${branchId}/approve-user/${userId}`, {
                method: 'PUT'
            });
            return response;
        } catch (error) {
            console.error('Error approving user:', error);
            throw error;
        }
    }

    // Reject user's branch membership request
    async rejectUser(branchId, userId) {
        try {
            const response = await apiRequest(`/branches/${branchId}/reject-user/${userId}`, {
                method: 'PUT'
            });
            return response;
        } catch (error) {
            console.error('Error rejecting user:', error);
            throw error;
        }
    }

    // Create branch deposit to customer account
    async createBranchDeposit(branchId, depositData) {
        try {
            const response = await apiRequest(`/branches/${branchId}/deposit`, {
                method: 'POST',
                body: JSON.stringify(depositData)
            });
            return response;
        } catch (error) {
            console.error('Error creating branch deposit:', error);
            throw error;
        }
    }
}

export default new BranchService();
