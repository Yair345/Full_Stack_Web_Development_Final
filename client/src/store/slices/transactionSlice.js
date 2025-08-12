import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    transactions: [],
    recentTransactions: [],
    loading: false,
    error: null,
    filters: {
        dateFrom: null,
        dateTo: null,
        type: 'all',
        accountId: null,
    },
};

const transactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        fetchTransactionsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchTransactionsSuccess: (state, action) => {
            state.loading = false;
            state.transactions = action.payload;
            state.error = null;
        },
        fetchTransactionsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addTransaction: (state, action) => {
            state.transactions.unshift(action.payload);
            state.recentTransactions.unshift(action.payload);
            if (state.recentTransactions.length > 10) {
                state.recentTransactions.pop();
            }
        },
        setTransactionFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearTransactionError: (state) => {
            state.error = null;
        },
    },
});

export const {
    fetchTransactionsStart,
    fetchTransactionsSuccess,
    fetchTransactionsFailure,
    addTransaction,
    setTransactionFilters,
    clearTransactionError,
} = transactionSlice.actions;

export default transactionSlice.reducer;
