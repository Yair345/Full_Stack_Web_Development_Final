import { useApi, useMutation } from '../core/useApiCore';
import { apiRequest } from '../../../services/api';

/**
 * Hook to fetch all branches
 * @param {Object} params - Query parameters
 * @returns {Object} Branches data and loading state
 */
export const useBranches = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/branches${queryString ? `?${queryString}` : ''}`;

    return useApi(
        endpoint,
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 2,
            dependencies: [JSON.stringify(params)],
        }
    );
};

/**
 * Hook to fetch a specific branch
 * @param {Number} branchId - Branch ID
 * @returns {Object} Branch data and loading state
 */
export const useBranch = (branchId) => {
    return useApi(
        branchId ? `/branches/${branchId}` : null,
        {
            immediate: !!branchId,
            dependencies: [branchId],
            cacheTime: 5 * 60 * 1000,
        }
    );
};

/**
 * Hook to fetch branch customers
 * @param {Number} branchId - Branch ID
 * @param {Object} params - Query parameters
 * @returns {Object} Customers data and loading state
 */
export const useBranchCustomers = (branchId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = branchId ? `/branches/${branchId}/customers${queryString ? `?${queryString}` : ''}` : null;

    return useApi(
        endpoint,
        {
            immediate: !!branchId,
            dependencies: [branchId, JSON.stringify(params)],
            cacheTime: 2 * 60 * 1000, // 2 minutes
        }
    );
};

/**
 * Hook to fetch branch statistics
 * @param {Number} branchId - Branch ID
 * @param {Object} params - Query parameters
 * @returns {Object} Statistics data and loading state
 */
export const useBranchStats = (branchId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = branchId ? `/branches/${branchId}/stats${queryString ? `?${queryString}` : ''}` : null;

    return useApi(
        endpoint,
        {
            immediate: !!branchId,
            dependencies: [branchId, JSON.stringify(params)],
            cacheTime: 1 * 60 * 1000, // 1 minute
        }
    );
};

/**
 * Hook to fetch branch loan applications
 * @param {Number} branchId - Branch ID
 * @param {Object} params - Query parameters
 * @returns {Object} Loan applications data and loading state
 */
export const useBranchLoans = (branchId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = branchId ? `/branches/${branchId}/loans${queryString ? `?${queryString}` : ''}` : null;

    return useApi(
        endpoint,
        {
            immediate: !!branchId,
            dependencies: [branchId, JSON.stringify(params)],
            cacheTime: 2 * 60 * 1000, // 2 minutes
        }
    );
};

/**
 * Hook to create a new branch
 * @returns {Object} Mutation object with mutate function
 */
export const useCreateBranch = () => {
    return useMutation(
        (branchData) => {
            return apiRequest('/branches', {
                method: 'POST',
                body: JSON.stringify(branchData),
            });
        }
    );
};

/**
 * Hook to update a branch
 * @returns {Object} Mutation object with mutate function
 */
export const useUpdateBranch = () => {
    return useMutation(
        ({ id, data }) => {
            return apiRequest(`/branches/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        }
    );
};

/**
 * Hook to delete a branch
 * @returns {Object} Mutation object with mutate function
 */
export const useDeleteBranch = () => {
    return useMutation(
        (branchId) => {
            return apiRequest(`/branches/${branchId}`, {
                method: 'DELETE',
            });
        }
    );
};

/**
 * Hook for all branch operations (CRUD)
 * @returns {Object} All branch operations
 */
export const useBranchOperations = () => {
    const createBranch = useCreateBranch();
    const updateBranch = useUpdateBranch();
    const deleteBranch = useDeleteBranch();

    return {
        createBranch: createBranch.mutate,
        updateBranch: updateBranch.mutate,
        deleteBranch: deleteBranch.mutate,
        isCreating: createBranch.isLoading,
        isUpdating: updateBranch.isLoading,
        isDeleting: deleteBranch.isLoading,
        createError: createBranch.error,
        updateError: updateBranch.error,
        deleteError: deleteBranch.error,
    };
};
