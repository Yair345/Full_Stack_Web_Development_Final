import { useApi, useMutation, useInfiniteApi } from '../core/useApiCore';
import { transactionAPI } from '../../../services/api';

/**
 * Hook for fetching transactions with filtering
 * @param {Object} filters - Transaction filters (accountId, dateRange, type, etc.)
 * @param {Object} options - Configuration options
 * @returns {Object} - { transactions, loading, error, refetch }
 */
export const useTransactions = (filters = {}, options = {}) => {
    const endpoint = `/transactions${new URLSearchParams(filters).toString() ? `?${new URLSearchParams(filters).toString()}` : ''}`;

    const { data: transactions, loading, error, refetch, mutate } = useApi(endpoint, {
        immediate: true,
        dependencies: [JSON.stringify(filters)],
        cacheTime: 1 * 60 * 1000, // 1 minute cache for transactions
        ...options,
    });

    return {
        transactions: transactions?.data || transactions || [],
        loading,
        error,
        refetch,
        mutate,
    };
};

/**
 * Hook for infinite scrolling transactions
 * @param {Object} filters - Transaction filters
 * @returns {Object} - { transactions, loading, error, loadMore, hasMore, refetch }
 */
export const useInfiniteTransactions = (filters = {}) => {
    const fetchTransactions = async ({ page, limit }) => {
        const params = {
            ...filters,
            page,
            limit,
        };
        return transactionAPI.getTransactions(params);
    };

    return useInfiniteApi(fetchTransactions, {
        pageSize: 20,
    });
};

/**
 * Hook for fetching a specific transaction
 * @param {string} transactionId - The transaction ID
 * @param {Object} options - Configuration options
 * @returns {Object} - { transaction, loading, error, refetch }
 */
export const useTransaction = (transactionId, options = {}) => {
    const { data: transaction, loading, error, refetch } = useApi(
        transactionId ? `/transactions/${transactionId}` : null,
        {
            immediate: !!transactionId,
            dependencies: [transactionId],
            ...options,
        }
    );

    return {
        transaction: transaction?.data || transaction,
        loading,
        error,
        refetch,
    };
};

/**
 * Hook for creating a new transaction
 * @returns {Object} - { createTransaction, loading, error, data }
 */
export const useCreateTransaction = () => {
    return useMutation(transactionAPI.createTransaction);
};
