import { useApi, useMutation, useInfiniteApi } from '../core/useApiCore';
import { transactionAPI, accountAPI } from '../../../services/api';
import { transformServerTransactions } from '../../../pages/Transactions/transactionUtils';
import { useMemo } from 'react';

/**
 * Hook for fetching transactions with filtering
 * @param {Object} filters - Transaction filters (accountId, dateRange, type, etc.)
 * @param {Object} options - Configuration options
 * @returns {Object} - { transactions, loading, error, refetch }
 */
export const useTransactions = (filters = {}, options = {}) => {
    // Get user accounts for transaction transformation
    const { data: accountsResponse, loading: accountsLoading, error: accountsError } = useApi('/accounts', { immediate: true });

    const endpoint = `/transactions${new URLSearchParams(filters).toString() ? `?${new URLSearchParams(filters).toString()}` : ''}`;

    const { data: transactionsResponse, loading: transactionsLoading, error, refetch, mutate } = useApi(endpoint, {
        immediate: true,
        dependencies: [JSON.stringify(filters)],
        cacheTime: 1 * 60 * 1000, // 1 minute cache for transactions
        ...options,
    });

    const transformedTransactions = useMemo(() => {
        try {
            // If there are errors or no data, return empty array
            if (error || accountsError || !transactionsResponse) {
                return [];
            }

            // Handle different possible response structures
            let transactions = [];
            if (transactionsResponse?.data?.transactions) {
                transactions = transactionsResponse.data.transactions;
            } else if (Array.isArray(transactionsResponse?.data)) {
                transactions = transactionsResponse.data;
            } else if (Array.isArray(transactionsResponse)) {
                transactions = transactionsResponse;
            }

            if (transactions.length === 0) {
                return [];
            }

            // If we don't have accounts data yet, return raw transaction data without transformation
            if (!accountsResponse?.data?.accounts) {

                return transactions;
            }

            // Extract user account IDs from the correct path
            const userAccountIds = accountsResponse.data.accounts.map(acc => acc.id);


            // Transform server transactions to client format
            const transformed = transformServerTransactions(transactions, userAccountIds);

            return transformed;
        } catch (error) {
            console.error('Error in transformedTransactions:', error);
            // Return raw data as fallback
            return transactionsResponse?.data?.transactions || [];
        }
    }, [transactionsResponse, accountsResponse, error, accountsError]);

    return {
        transactions: transformedTransactions,
        pagination: transactionsResponse?.data?.pagination,
        loading: transactionsLoading || accountsLoading,
        error: error || accountsError,
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

/**
 * Hook for creating a new transfer
 * @returns {Object} - { mutate: createTransfer, loading, error, data }
 */
export const useCreateTransfer = () => {
    return useMutation(transactionAPI.createTransfer);
};

/**
 * Hook for creating a deposit
 * @returns {Object} - { createDeposit, loading, error, data }
 */
export const useCreateDeposit = () => {
    return useMutation(transactionAPI.createDeposit);
};

/**
 * Hook for creating a withdrawal
 * @returns {Object} - { createWithdrawal, loading, error, data }
 */
export const useCreateWithdrawal = () => {
    return useMutation(transactionAPI.createWithdrawal);
};

/**
 * Hook for canceling a transaction
 * @returns {Object} - { cancelTransaction, loading, error, data }
 */
export const useCancelTransaction = () => {
    return useMutation(transactionAPI.cancelTransaction);
};

/**
 * Hook for fetching transaction summary data
 * @param {Object} filters - Transaction filters
 * @param {Object} options - Configuration options
 * @returns {Object} - { summary, loading, error, refetch }
 */
export const useTransactionSummary = (filters = {}, options = {}) => {
    const endpoint = `/transactions/summary${new URLSearchParams(filters).toString() ? `?${new URLSearchParams(filters).toString()}` : ''}`;

    const { data: summary, loading, error, refetch } = useApi(endpoint, {
        immediate: true,
        dependencies: [JSON.stringify(filters)],
        cacheTime: 2 * 60 * 1000, // 2 minutes cache for summary
        ...options,
    });

    return {
        summary: summary?.data || summary,
        loading,
        error,
        refetch,
    };
};
