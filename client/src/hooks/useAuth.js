import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { logout } from '../store/slices/authSlice';

export const useAuth = () => {
    const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutUser = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Check token expiration
    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000;

                if (payload.exp < currentTime) {
                    logoutUser();
                }
            } catch (error) {
                // Invalid token
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
    };
};
