import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: sessionStorage.getItem('token'),
    refreshToken: sessionStorage.getItem('refreshToken'),
    isAuthenticated: !!sessionStorage.getItem('token'),
    isInitialized: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.isInitialized = true;
            state.error = null;
            sessionStorage.setItem('token', action.payload.token);
            if (action.payload.refreshToken) {
                sessionStorage.setItem('refreshToken', action.payload.refreshToken);
            }
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.error = action.payload;
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.error = null;
            state.loading = false;
            state.isInitialized = true; // Keep initialized as true to prevent re-initialization loops
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isInitialized = true;
        },
        clearError: (state) => {
            state.error = null;
        },
        refreshTokenStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        refreshTokenSuccess: (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.error = null;
            sessionStorage.setItem('token', action.payload.token);
            if (action.payload.refreshToken) {
                sessionStorage.setItem('refreshToken', action.payload.refreshToken);
            }
        },
        refreshTokenFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        initializationComplete: (state) => {
            state.isInitialized = true;
            state.loading = false;
        },
        initializationStart: (state) => {
            state.isInitialized = false;
            state.loading = true;
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    setUser,
    clearError,
    refreshTokenStart,
    refreshTokenSuccess,
    refreshTokenFailure,
    initializationComplete,
    initializationStart
} = authSlice.actions;
export default authSlice.reducer;
