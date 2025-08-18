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
        // Reduce cache time for accounts to make refreshing more responsive
        cacheTime: 30 * 1000, // 30 seconds cache for accounts
        ...options,
    });

    // Transform the raw server data to frontend format
    const accounts = rawData ? transformServerAccounts(rawData.data || rawData || []) : [];
    const rawAccounts = rawData ? (rawData.data || rawData || []) : [];

    return {
        accounts,
        rawAccounts, // Also return raw accounts for validation purposes
        loading,
        error,
        refetch: (customOptions = {}) => {
            return refetch(customOptions);
        },
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
 * Hook for checking if user has existing checking account
 * @returns {Object} - { hasCheckingAccount, loading, error, checkExistingAccounts }
 */
export const useCheckExistingAccounts = () => {
    const { data, loading, error, refetch } = useApi('/accounts/check-existing', {
        immediate: false, // Only fetch when called
        cacheTime: 0, // Don't cache this data
    });

    const hasCheckingAccount = data?.data?.hasCheckingAccount || false;

    return {
        hasCheckingAccount,
        loading,
        error,
        checkExistingAccounts: refetch,
    };
};

/**
 * Hook for creating a new account
 * @returns {Object} - { createAccount, loading, error, data }
 */
export const useCreateAccount = () => {
    const mutation = useMutation(accountAPI.createAccount);

    return {
        ...mutation,
        mutate: async (accountData) => {
            try {
                const result = await mutation.mutate(accountData);

                // Force a global cache refresh for accounts
                if (typeof window !== 'undefined' && window.location) {
                    // Use a small delay to ensure backend has processed everything
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('account-created', {
                            detail: { accountData: result }
                        }));
                    }, 100);
                }

                return result;
            } catch (error) {
                console.error("Account creation failed:", error);
                throw error;
            }
        }
    };
};

/**
 * Hook for updating an account
 * @returns {Object} - { updateAccount, loading, error, data }
 */
export const useUpdateAccount = () => {
    return useMutation(({ id, data }) => accountAPI.updateAccount(id, data));
};
