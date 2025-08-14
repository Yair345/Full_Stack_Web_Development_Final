import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '../core/useApiCore';
import { useAccounts } from './useAccountHooks';
import { useTransactions } from './useTransactionHooks';

/**
 * Hook for fetching dashboard data (accounts + recent transactions)
 * @param {Object} options - Configuration options
 * @returns {Object} - { accounts, recentTransactions, loading, error, refetch }
 */
export const useDashboard = (options = {}) => {
    const accountsResult = useAccounts(options);
    const transactionsResult = useTransactions({ limit: 10 }, options);

    const loading = accountsResult.loading || transactionsResult.loading;
    const error = accountsResult.error || transactionsResult.error;

    const refetch = async () => {
        await Promise.all([
            accountsResult.refetch(),
            transactionsResult.refetch(),
        ]);
    };

    return {
        accounts: accountsResult.accounts,
        recentTransactions: transactionsResult.transactions,
        loading,
        error,
        refetch,
    };
};

/**
 * Hook for real-time data updates using polling
 * @param {Function} fetchFunction - Function to fetch data
 * @param {number} interval - Polling interval in milliseconds (default: 30 seconds)
 * @param {boolean} enabled - Whether polling is enabled
 * @returns {Object} - { data, loading, error, startPolling, stopPolling }
 */
export const usePolling = (fetchFunction, interval = 30000, enabled = true) => {
    const [isPolling, setIsPolling] = useState(enabled);
    const intervalRef = useRef(null);

    const { data, loading, error, refetch } = useApi(null, {
        immediate: false,
    });

    const startPolling = useCallback(() => {
        setIsPolling(true);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Initial fetch
        fetchFunction().then(refetch);

        // Set up polling
        intervalRef.current = setInterval(() => {
            fetchFunction().then(refetch);
        }, interval);
    }, [fetchFunction, refetch, interval]);

    const stopPolling = useCallback(() => {
        setIsPolling(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (enabled && isPolling) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => {
            stopPolling();
        };
    }, [enabled, isPolling, startPolling, stopPolling]);

    return {
        data,
        loading,
        error,
        startPolling,
        stopPolling,
        isPolling,
    };
};
