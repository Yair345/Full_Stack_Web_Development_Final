import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { logout } from '../store/slices/authSlice';
import { useTokenRefresh } from './useTokenRefresh';

export const useAuth = () => {
    const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Initialize token refresh functionality
    const { refreshToken, isTokenExpiringSoon, getTokenExpiry } = useTokenRefresh();

    const logoutUser = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Check token expiration on token change
    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000;

                // If token is already expired, logout immediately
                if (payload.exp < currentTime) {
                    logoutUser();
                }
            } catch (error) {
                // Invalid token
                console.error('Invalid token format:', error);
                logoutUser();
            }
        }
    }, [token]);

    return {
        user,
        token,
        isAuthenticated,
        loading,
        error,
        logout: logoutUser,
        refreshToken,
        isTokenExpiringSoon,
        getTokenExpiry,
    };
};
