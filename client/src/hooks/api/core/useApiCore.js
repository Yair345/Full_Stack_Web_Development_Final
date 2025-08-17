import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '../../../services/api';

/**
 * Custom hook for handling API requests with loading states, error handling, and caching
 * @param {string} endpoint - The API endpoint to fetch from
 * @param {Object} options - Configuration options
 * @param {boolean} options.immediate - Whether to fetch immediately on mount (default: true)
 * @param {Object} options.dependencies - Array of dependencies to trigger refetch
 * @param {number} options.cacheTime - Cache time in milliseconds (default: 5 minutes)
 * @param {Object} options.defaultData - Default data to return while loading
 * @returns {Object} - { data, loading, error, refetch, mutate }
 */
export const useApi = (endpoint, options = {}) => {
    const {
        immediate = true,
        dependencies = [],
        cacheTime = 5 * 60 * 1000, // 5 minutes
        defaultData = null,
        ...requestOptions
    } = options;

    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);
    const cacheRef = useRef({ data: null, timestamp: null });

    const fetchData = useCallback(async (customEndpoint = endpoint, customOptions = {}) => {
        // If forceRefresh is requested, clear cache immediately
        if (customOptions.forceRefresh || customOptions.cache === 'reload') {
            console.log('Clearing cache due to forceRefresh or reload');
            cacheRef.current = { data: null, timestamp: null };
        }

        // Check cache only if not forcing refresh
        if (!customOptions.forceRefresh && customOptions.cache !== 'reload') {
            const now = Date.now();
            const cachedData = cacheRef.current;
            if (
                cachedData.data &&
                cachedData.timestamp &&
                (now - cachedData.timestamp) < cacheTime &&
                customEndpoint === endpoint
            ) {
                console.log('Using cached data');
                setData(cachedData.data);
                setLoading(false);
                return cachedData.data;
            }
        }

        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            console.log('Making fresh API request to:', customEndpoint);
            const requestConfig = {
                ...requestOptions,
                ...customOptions,
                signal: abortControllerRef.current.signal,
            };

            const result = await apiRequest(customEndpoint, requestConfig);
            console.log('API request result:', result);

            // Cache the result
            const now = Date.now();
            cacheRef.current = {
                data: result,
                timestamp: now,
            };

            setData(result);
            return result;
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'An error occurred');
                console.error('API Error:', err);
            }
            // Don't throw AbortErrors as they are expected during cleanup
            if (err.name !== 'AbortError') {
                throw err;
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [endpoint, cacheTime, JSON.stringify(requestOptions)]);

    // Refetch function that can be called manually
    const refetch = useCallback((customOptions = {}) => {
        console.log('Refetch called with options:', customOptions);
        // Always force refresh when refetch is called manually
        const options = { forceRefresh: true, ...customOptions };
        return fetchData(endpoint, options);
    }, [fetchData, endpoint]);

    // Mutate function for optimistic updates
    const mutate = useCallback((newData, shouldRevalidate = true) => {
        if (typeof newData === 'function') {
            setData(prevData => newData(prevData));
        } else {
            setData(newData);
        }

        // Update cache
        cacheRef.current = {
            data: typeof newData === 'function' ? newData(cacheRef.current.data) : newData,
            timestamp: Date.now(),
        };

        if (shouldRevalidate) {
            refetch();
        }
    }, [refetch]);

    // Effect for initial fetch and dependency changes
    useEffect(() => {
        if (immediate && endpoint) {
            fetchData();
        }

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [immediate, endpoint, ...dependencies]);

    return {
        data,
        loading,
        error,
        refetch,
        mutate,
        fetchData, // For manual fetching with custom endpoint
    };
};

/**
 * Hook for handling mutations (POST, PUT, DELETE operations)
 * @param {Function} mutationFn - Function that performs the mutation
 * @returns {Object} - { mutate, loading, error, data }
 */
export const useMutation = (mutationFn) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const mutate = useCallback(async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const result = await mutationFn(...args);
            setData(result);
            return result;
        } catch (err) {
            setError(err.message || 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [mutationFn]);

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        mutate,
        loading,
        error,
        data,
        reset,
    };
};

/**
 * Hook for infinite scrolling/pagination
 * @param {Function} fetchFunction - Function to fetch paginated data
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, loadMore, hasMore, refetch }
 */
export const useInfiniteApi = (fetchFunction, options = {}) => {
    const { pageSize = 20, initialPage = 1 } = options;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);

    const fetchPage = useCallback(async (pageNumber, reset = false) => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFunction({
                page: pageNumber,
                limit: pageSize,
            });

            const newData = result.data || result;
            const hasMoreData = newData.length === pageSize;

            if (reset) {
                setData(newData);
            } else {
                setData(prevData => [...prevData, ...newData]);
            }

            setHasMore(hasMoreData);
            setPage(pageNumber);
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [fetchFunction, pageSize]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchPage(page + 1);
        }
    }, [loading, hasMore, page, fetchPage]);

    const refetch = useCallback(() => {
        setPage(initialPage);
        fetchPage(initialPage, true);
    }, [initialPage, fetchPage]);

    useEffect(() => {
        fetchPage(initialPage, true);
    }, [fetchPage, initialPage]);

    return {
        data,
        loading,
        error,
        loadMore,
        hasMore,
        refetch,
    };
};

export default useApi;
