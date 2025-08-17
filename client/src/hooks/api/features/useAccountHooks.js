import { useApi, useMutation } from '../core/useApiCore';
import { accountAPI } from '../../../services/api';
import { transformServerAccounts, transformServerAccount } from '../../../pages/Accounts/accountUtils';

/**
 * Hook for fetching user accounts
 * @param {Object} options - Configuration options
 * @returns {Object} - { accounts, loading, error, refetch }
 */
export const useAccounts = (options = {}) => {
    const { data: rawData, loading, error, refetch, mutate } = useApi('/accounts', {
        immediate: true,
        cacheTime: 2 * 60 * 1000, // 2 minutes cache for accounts
        ...options,
    });

    // Transform the raw server data to frontend format
    const accounts = rawData ? transformServerAccounts(rawData.data || rawData || []) : [];

    return {
        accounts,
        loading,
        error,
        refetch,
        mutate: (newData, shouldRevalidate) => {
            // If mutating with new data, transform it first
            const transformedData = newData ? {
                ...rawData,
                data: transformServerAccounts(newData.data || newData || [])
            } : newData;
            return mutate(transformedData, shouldRevalidate);
        },
    };
};

/**
 * Hook for fetching a specific account
 * @param {string} accountId - The account ID
 * @param {Object} options - Configuration options
 * @returns {Object} - { account, loading, error, refetch }
 */
export const useAccount = (accountId, options = {}) => {
    const { data: rawAccount, loading, error, refetch } = useApi(
        accountId ? `/accounts/${accountId}` : null,
        {
            immediate: !!accountId,
            dependencies: [accountId],
            ...options,
        }
    );

    // Transform the raw server data to frontend format
    const account = rawAccount ? transformServerAccount(rawAccount.data || rawAccount) : null;

    return {
        account,
        loading,
        error,
        refetch,
    };
};

/**
 * Hook for creating a new account
 * @returns {Object} - { createAccount, loading, error, data }
 */
export const useCreateAccount = () => {
    return useMutation(accountAPI.createAccount);
};

/**
 * Hook for updating an account
 * @returns {Object} - { updateAccount, loading, error, data }
 */
export const useUpdateAccount = () => {
    return useMutation(({ id, data }) => accountAPI.updateAccount(id, data));
};
