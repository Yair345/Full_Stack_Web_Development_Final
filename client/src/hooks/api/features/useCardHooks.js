import { useApi, useMutation } from '../core/useApiCore';
import { cardAPI } from '../../../services/api';

/**
 * Hook to fetch all cards for the authenticated user
 * @param {Object} params - Query parameters (account_id, status, card_type)
 * @param {Object} options - Additional options for the hook
 * @returns {Object} { data, loading, error, refetch }
 */
export const useCards = (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/cards${queryString ? `?${queryString}` : ''}`;

    return useApi(endpoint, {
        immediate: true,
        cacheTime: 30 * 1000, // 30 seconds cache
        ...options,
    });
};

/**
 * Hook to fetch a specific card by ID
 * @param {number|string} cardId - The card ID
 * @param {Object} options - Additional options for the hook
 * @returns {Object} { data, loading, error, refetch }
 */
export const useCard = (cardId, options = {}) => {
    return useApi(`/cards/${cardId}`, {
        immediate: !!cardId,
        cacheTime: 30 * 1000,
        ...options,
    });
};

/**
 * Hook to create a new card
 * @param {Object} options - Additional options for the hook
 * @returns {Object} { mutate, data, loading, error, reset }
 */
export const useCreateCard = (options = {}) => {
    return useMutation(cardAPI.createCard, {
        ...options,
    });
};

/**
 * Hook to update a card
 * @param {Object} options - Additional options for the hook
 * @returns {Object} { mutate, data, loading, error, reset }
 */
export const useUpdateCard = (options = {}) => {
    return useMutation(({ cardId, ...cardData }) => cardAPI.updateCard(cardId, cardData), {
        ...options,
    });
};

/**
 * Hook to toggle card block status
 * @param {Object} options - Additional options for the hook
 * @returns {Object} { mutate, data, loading, error, reset }
 */
export const useToggleCardBlock = (options = {}) => {
    return useMutation(cardAPI.toggleCardBlock, {
        ...options,
    });
};

/**
 * Hook to cancel a card
 * @param {Object} options - Additional options for the hook
 * @returns {Object} { mutate, data, loading, error, reset }
 */
export const useCancelCard = (options = {}) => {
    return useMutation(cardAPI.cancelCard, {
        ...options,
    });
};

/**
 * Hook to change card PIN
 * @param {Object} options - Additional options for the hook
 * @returns {Object} { mutate, data, loading, error, reset }
 */
export const useChangeCardPin = (options = {}) => {
    return useMutation(({ cardId, ...pinData }) => cardAPI.changePin(cardId, pinData), {
        ...options,
    });
};
