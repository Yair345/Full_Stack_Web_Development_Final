import { useApi, useMutation } from '../core/useApiCore';
import { standingOrderAPI } from '../../../services/api';
import { useMemo } from 'react';

/**
 * Hook for fetching standing orders
 * @param {Object} filters - Standing order filters
 * @param {Object} options - Configuration options
 * @returns {Object} - { standingOrders, loading, error, refetch }
 */
export const useStandingOrders = (filters = {}, options = {}) => {
    const endpoint = `/standing-orders${new URLSearchParams(filters).toString() ? `?${new URLSearchParams(filters).toString()}` : ''}`;

    const { data: response, loading, error, refetch, mutate } = useApi(endpoint, {
        immediate: true,
        dependencies: [JSON.stringify(filters)],
        cacheTime: 2 * 60 * 1000, // 2 minutes cache
        ...options,
    });

    const standingOrders = useMemo(() => {
        try {
            if (error || !response) {
                return [];
            }

            // Handle different possible response structures
            let orders = [];
            if (response?.data?.standing_orders) {
                orders = response.data.standing_orders;
            } else if (Array.isArray(response?.data)) {
                orders = response.data;
            } else if (Array.isArray(response)) {
                orders = response;
            }

            // Transform to match UI expectations
            return orders.map(order => ({
                id: order.id,
                recipient: order.beneficiary_name,
                amount: parseFloat(order.amount),
                frequency: order.frequency.charAt(0).toUpperCase() + order.frequency.slice(1),
                nextDate: order.next_execution_date,
                status: order.status,
                description: order.description || '',
                reference: order.reference || '',
                fromAccount: order.fromAccount,
                toAccount: order.toAccount,
                externalAccountNumber: order.external_account_number,
                created_at: order.created_at,
                updated_at: order.updated_at
            }));
        } catch (error) {
            console.error('Error transforming standing orders:', error);
            return [];
        }
    }, [response, error]);

    return {
        standingOrders,
        pagination: response?.data?.pagination,
        loading,
        error,
        refetch,
        mutate,
    };
};

/**
 * Hook for fetching a specific standing order
 * @param {string} standingOrderId - The standing order ID
 * @param {Object} options - Configuration options
 * @returns {Object} - { standingOrder, loading, error, refetch }
 */
export const useStandingOrder = (standingOrderId, options = {}) => {
    const { data: response, loading, error, refetch } = useApi(
        standingOrderId ? `/standing-orders/${standingOrderId}` : null,
        {
            immediate: !!standingOrderId,
            dependencies: [standingOrderId],
            ...options,
        }
    );

    return {
        standingOrder: response?.data?.standing_order || response?.data,
        loading,
        error,
        refetch,
    };
};

/**
 * Hook for creating a new standing order
 * @returns {Object} - { createStandingOrder, loading, error, data }
 */
export const useCreateStandingOrder = () => {
    return useMutation(standingOrderAPI.createStandingOrder, {
        onSuccess: (data) => {
            console.log('Standing order created successfully:', data);
        },
        onError: (error) => {
            console.error('Standing order creation failed:', error);
        }
    });
};

/**
 * Hook for updating a standing order
 * @returns {Object} - { updateStandingOrder, loading, error, data }
 */
export const useUpdateStandingOrder = () => {
    return useMutation(({ id, data }) => standingOrderAPI.updateStandingOrder(id, data));
};

/**
 * Hook for toggling standing order status (pause/resume)
 * @returns {Object} - { toggleStandingOrder, loading, error, data }
 */
export const useToggleStandingOrder = () => {
    return useMutation(standingOrderAPI.toggleStandingOrderStatus);
};

/**
 * Hook for canceling a standing order
 * @returns {Object} - { cancelStandingOrder, loading, error, data }
 */
export const useCancelStandingOrder = () => {
    return useMutation(standingOrderAPI.cancelStandingOrder);
};
