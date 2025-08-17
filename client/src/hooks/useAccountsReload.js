import { useState, useEffect, useCallback, useRef } from 'react';
import { accountAPI } from '../services/api';
import { transformServerAccounts } from '../pages/Accounts/accountUtils';

/**
 * Custom hook specifically for accounts with reliable reload mechanism
 * This replaces the useAccounts hook for better control over data fetching
 */
export const useAccountsReload = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);
    const abortControllerRef = useRef(null);
    const mountedRef = useRef(true);

    // Cleanup function to cancel ongoing requests
    const cancelOngoingRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    // Main fetch function
    const fetchAccounts = useCallback(async (options = {}) => {
        const { isRefresh = false, silent = false } = options;

        // Cancel any ongoing request
        cancelOngoingRequest();

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        try {
            // Set loading states
            if (isRefresh) {
                setIsRefreshing(true);
            } else if (!silent) {
                setLoading(true);
            }

            // Clear any existing errors
            setError(null);

            console.log('Fetching accounts...', { isRefresh, silent });

            // Make API call with abort signal
            const response = await accountAPI.getAccounts();

            // Check if component is still mounted
            if (!mountedRef.current) return null;

            console.log('Raw accounts response:', response);

            // Extract accounts data
            const accountsData = response?.data || response || [];
            console.log('Accounts data to transform:', accountsData);

            // Transform server data to frontend format
            const transformedAccounts = transformServerAccounts(accountsData);
            console.log('Transformed accounts:', transformedAccounts);

            // Update state
            setAccounts(transformedAccounts);

            if (isRefresh) {
                setLastRefresh(new Date());
            }

            return transformedAccounts;
        } catch (err) {
            if (!mountedRef.current) return null;

            // Don't set error for aborted requests
            if (err.name !== 'AbortError') {
                console.error('Failed to fetch accounts:', err);
                setError(err.message || 'Failed to load accounts');
            }
            throw err;
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
            abortControllerRef.current = null;
        }
    }, [cancelOngoingRequest]);

    // Reload function for manual refresh
    const reloadAccounts = useCallback(async () => {
        try {
            console.log('Manual reload requested');
            return await fetchAccounts({ isRefresh: true });
        } catch (error) {
            console.error('Manual reload failed:', error);
            throw error;
        }
    }, [fetchAccounts]);

    // Silent refresh (doesn't show loading indicators)
    const silentRefresh = useCallback(async () => {
        try {
            return await fetchAccounts({ silent: true });
        } catch (error) {
            console.error('Silent refresh failed:', error);
            // Don't throw for silent refresh failures
            return accounts; // Return current accounts
        }
    }, [fetchAccounts, accounts]);

    // Initial load effect
    useEffect(() => {
        mountedRef.current = true;

        // Initial fetch
        fetchAccounts({ isRefresh: false });

        // Cleanup function
        return () => {
            mountedRef.current = false;
            cancelOngoingRequest();
        };
    }, [fetchAccounts, cancelOngoingRequest]);

    // Add account optimistically (for after account creation)
    const addAccountOptimistically = useCallback((newAccount) => {
        console.log('Adding account optimistically:', newAccount);
        setAccounts(prevAccounts => {
            // Check if account already exists
            const exists = prevAccounts.some(acc => acc.id === newAccount.id);
            if (!exists) {
                return [...prevAccounts, newAccount];
            }
            return prevAccounts;
        });
    }, []);

    // Update specific account
    const updateAccount = useCallback((accountId, updatedData) => {
        setAccounts(prevAccounts =>
            prevAccounts.map(account =>
                account.id === accountId
                    ? { ...account, ...updatedData }
                    : account
            )
        );
    }, []);

    // Remove account
    const removeAccount = useCallback((accountId) => {
        setAccounts(prevAccounts =>
            prevAccounts.filter(account => account.id !== accountId)
        );
    }, []);

    return {
        accounts,
        loading,
        error,
        isRefreshing,
        lastRefresh,
        reloadAccounts,
        silentRefresh,
        addAccountOptimistically,
        updateAccount,
        removeAccount,
        // Expose internal functions for advanced use cases
        fetchAccounts,
        cancelOngoingRequest
    };
};

export default useAccountsReload;
