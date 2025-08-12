import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    accounts: [],
    selectedAccount: null,
    loading: false,
    error: null,
};

const accountSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        fetchAccountsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchAccountsSuccess: (state, action) => {
            state.loading = false;
            state.accounts = action.payload;
            state.error = null;
        },
        fetchAccountsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        selectAccount: (state, action) => {
            state.selectedAccount = action.payload;
        },
        updateAccountBalance: (state, action) => {
            const { accountId, newBalance } = action.payload;
            const account = state.accounts.find(acc => acc.id === accountId);
            if (account) {
                account.balance = newBalance;
            }
        },
        clearAccountError: (state) => {
            state.error = null;
        },
    },
});

export const {
    fetchAccountsStart,
    fetchAccountsSuccess,
    fetchAccountsFailure,
    selectAccount,
    updateAccountBalance,
    clearAccountError,
} = accountSlice.actions;

export default accountSlice.reducer;
