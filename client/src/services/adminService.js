import { apiRequest } from './api';

class AdminService {
    /**
     * Get admin dashboard overview
     */
    async getAdminOverview() {
        try {
            const response = await apiRequest('/admin/overview');
            return response;
        } catch (error) {
            console.error('Error getting admin overview:', error);
            throw error;
        }
    }

    /**
     * Get all users for admin management
     */
    async getUsers(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
            return response;
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }

    /**
     * Get single user by ID
     */
    async getUserById(userId) {
        try {
            const response = await apiRequest(`/admin/users/${userId}`);
            return response;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    /**
     * Update user information
     */
    async updateUser(userId, userData) {
        try {
            const response = await apiRequest(`/admin/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
            return response;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Update user status
     */
    async updateUserStatus(userId, action, reason = null) {
        try {
            // Don't send reason if it's null or undefined
            const body = { action };
            if (reason) {
                body.reason = reason;
            }

            const response = await apiRequest(`/admin/users/${userId}/status`, {
                method: 'PUT',
                body: JSON.stringify(body)
            });
            return response;
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }

    /**
     * Delete user
     */
    async deleteUser(userId) {
        try {
            const response = await apiRequest(`/admin/users/${userId}`, {
                method: 'DELETE'
            });
            return response;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }    /**
     * Get all branches for admin management
     */
    async getBranches(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await apiRequest(`/admin/branches${queryString ? `?${queryString}` : ''}`);
            return response;
        } catch (error) {
            console.error('Error getting branches:', error);
            throw error;
        }
    }

    /**
     * Get available managers for branch assignment
     */
    async getAvailableManagers() {
        try {
            const response = await apiRequest('/admin/available-managers');
            return response;
        } catch (error) {
            console.error('Error getting available managers:', error);
            throw error;
        }
    }

    /**
     * Create new branch
     */
    async createBranch(branchData) {
        try {
            const response = await apiRequest('/admin/branches', {
                method: 'POST',
                body: JSON.stringify(branchData)
            });
            return response;
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error;
        }
    }

    /**
     * Update branch
     */
    async updateBranch(branchId, branchData) {
        try {
            const response = await apiRequest(`/admin/branches/${branchId}`, {
                method: 'PUT',
                body: JSON.stringify(branchData)
            });
            return response;
        } catch (error) {
            console.error('Error updating branch:', error);
            throw error;
        }
    }

    /**
     * Delete branch
     */
    async deleteBranch(branchId) {
        try {
            const response = await apiRequest(`/admin/branches/${branchId}`, {
                method: 'DELETE'
            });
            return response;
        } catch (error) {
            console.error('Error deleting branch:', error);
            throw error;
        }
    }

    /**
     * Get recent activity logs
     */
    async getActivityLogs(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await apiRequest(`/audit/logs${queryString ? `?${queryString}` : ''}`);
            return response;
        } catch (error) {
            console.error('Error getting activity logs:', error);
            throw error;
        }
    }
}

const adminService = new AdminService();
export default adminService;
