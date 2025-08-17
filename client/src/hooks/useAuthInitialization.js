import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logout, refreshTokenStart, refreshTokenSuccess, refreshTokenFailure } from '../store/slices/authSlice';

export const useAuthInitialization = () => {
    const dispatch = useDispatch();
    const { token, user, refreshToken, loading } = useSelector((state) => state.auth);
    const initializationAttempted = useRef(false);

    // Helper function to check if token is expired
    const isTokenExpired = useCallback((token) => {
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error parsing token:', error);
            return true;
        }
    }, []);

    // Function to attempt token refresh
    const attemptTokenRefresh = useCallback(async () => {
        if (!refreshToken) {
            console.log('No refresh token available');
            dispatch(logout());
            return false;
        }

        try {
            dispatch(refreshTokenStart());
            console.log('Attempting to refresh token...');

            // Use the refresh token directly in the API call
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Token refresh failed');
            }

            const data = await response.json();

            dispatch(refreshTokenSuccess({
                token: data.accessToken || data.token,
                refreshToken: data.refreshToken || refreshToken
            }));

            console.log('Token refreshed successfully');
            return data.accessToken || data.token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            dispatch(refreshTokenFailure(error.message));
            dispatch(logout());
            return false;
        }
    }, [refreshToken, dispatch]);

    // Function to get user profile with current or refreshed token
    const getUserProfile = useCallback(async (currentToken) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to get user profile');
            }

            const userData = await response.json();
            const user = userData.user || userData;

            // Transform server field names to match client expectations
            const transformedUser = {
                ...user,
                firstName: user.first_name,
                lastName: user.last_name
            };

            dispatch(setUser(transformedUser));
            console.log('User profile loaded successfully');
        } catch (error) {
            console.error('Failed to get user profile:', error);
            // If profile fetch fails, logout the user
            dispatch(logout());
        }
    }, [dispatch]);

    // Initialize user on app start
    useEffect(() => {
        const initializeUser = async () => {
            // Prevent multiple initialization attempts
            if (initializationAttempted.current) return;
            initializationAttempted.current = true;

            // If no token, do nothing
            if (!token) {
                console.log('No token found');
                return;
            }

            // Always fetch user profile if we have a token but no user
            if (!user) {
                console.log('Initializing user authentication - fetching user profile...');

                // Check if current token is expired
                if (isTokenExpired(token)) {
                    console.log('Token is expired, attempting refresh...');
                    const newToken = await attemptTokenRefresh();
                    if (newToken) {
                        await getUserProfile(newToken);
                    }
                } else {
                    console.log('Token is valid, getting user profile...');
                    await getUserProfile(token);
                }
            } else {
                console.log('User already exists');
            }
        };

        initializeUser();
    }, [token, user, isTokenExpired, attemptTokenRefresh, getUserProfile]);

    return { loading };
};
