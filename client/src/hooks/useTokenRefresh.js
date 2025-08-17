import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    refreshTokenStart,
    refreshTokenSuccess,
    refreshTokenFailure,
    logout
} from '../store/slices/authSlice';
import { authAPI } from '../services/api';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const TOKEN_BUFFER = 2 * 60 * 1000; // 2 minutes before expiry

export const useTokenRefresh = () => {
    const dispatch = useDispatch();
    const { token, refreshToken, isAuthenticated } = useSelector((state) => state.auth);
    const refreshIntervalRef = useRef(null);
    const alertShownRef = useRef(false);

    const getTokenExpiry = useCallback((token) => {
        try {
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000; // Convert to milliseconds
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }, []);

    const isTokenExpiringSoon = useCallback((token) => {
        const expiry = getTokenExpiry(token);
        if (!expiry) return true;

        const now = Date.now();
        return (expiry - now) <= TOKEN_BUFFER;
    }, [getTokenExpiry]);

    const refreshTokenAsync = useCallback(async () => {
        if (!refreshToken || !isAuthenticated) return false;

        try {
            dispatch(refreshTokenStart());

            const response = await authAPI.refreshToken();

            dispatch(refreshTokenSuccess({
                token: response.accessToken,
                refreshToken: response.refreshToken
            }));

            alertShownRef.current = false; // Reset alert flag on successful refresh
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            dispatch(refreshTokenFailure(error.message));
            return false;
        }
    }, [dispatch, refreshToken, isAuthenticated]);

    const handleTokenRefresh = useCallback(async () => {
        if (!token || !isAuthenticated) return;

        const needsRefresh = isTokenExpiringSoon(token);

        if (needsRefresh) {
            console.log('Token is expiring soon, attempting refresh...');
            const success = await refreshTokenAsync();

            if (!success && !alertShownRef.current) {
                alertShownRef.current = true;

                const userChoice = window.confirm(
                    'Your session is about to expire. Would you like to refresh your session to continue?'
                );

                if (userChoice) {
                    const retrySuccess = await refreshTokenAsync();
                    if (!retrySuccess) {
                        alert('Failed to refresh session. You will be logged out.');
                        dispatch(logout());
                    }
                } else {
                    dispatch(logout());
                }
            }
        }
    }, [token, isAuthenticated, isTokenExpiringSoon, refreshTokenAsync, dispatch]);

    const startRefreshInterval = useCallback(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
        }

        refreshIntervalRef.current = setInterval(() => {
            handleTokenRefresh();
        }, REFRESH_INTERVAL);
    }, [handleTokenRefresh]);

    const stopRefreshInterval = useCallback(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
    }, []);

    // Effect to manage refresh interval based on authentication state
    useEffect(() => {
        if (isAuthenticated && token) {
            // Check immediately on mount/auth change
            handleTokenRefresh();
            // Start the interval
            startRefreshInterval();
        } else {
            stopRefreshInterval();
            alertShownRef.current = false;
        }

        // Cleanup on unmount or auth change
        return () => {
            stopRefreshInterval();
        };
    }, [isAuthenticated, token, handleTokenRefresh, startRefreshInterval, stopRefreshInterval]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopRefreshInterval();
        };
    }, [stopRefreshInterval]);

    return {
        refreshToken: refreshTokenAsync,
        isTokenExpiringSoon: () => isTokenExpiringSoon(token),
        getTokenExpiry: () => getTokenExpiry(token),
    };
};
