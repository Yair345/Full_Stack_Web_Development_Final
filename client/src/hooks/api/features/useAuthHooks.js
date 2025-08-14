import { useMutation } from '../core/useApiCore';
import { authAPI } from '../../../services/api';

/**
 * Hook for authentication operations
 * @returns {Object} - Authentication mutation functions
 */
export const useAuthMutations = () => {
    const loginMutation = useMutation(authAPI.login);
    const registerMutation = useMutation(authAPI.register);
    const logoutMutation = useMutation(authAPI.logout);
    const refreshTokenMutation = useMutation(authAPI.refreshToken);

    return {
        login: loginMutation,
        register: registerMutation,
        logout: logoutMutation,
        refreshToken: refreshTokenMutation,
    };
};
