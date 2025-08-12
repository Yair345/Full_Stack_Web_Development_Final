import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import accountSlice from './slices/accountSlice';
import transactionSlice from './slices/transactionSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        accounts: accountSlice,
        transactions: transactionSlice,
    },
});

export default store;
