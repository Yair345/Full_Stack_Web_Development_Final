import { useState, useEffect, useCallback } from 'react';
import { loanAPI } from '../services/api';

/**
 * Custom hook for managing loan operations
 */
export const useLoans = () => {
    const [loans, setLoans] = useState([]);
    const [loanSummary, setLoanSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all loans for the current user
     */
    const fetchLoans = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await loanAPI.getLoans(params);
            setLoans(response.data.loans);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch loan summary/statistics
     */
    const fetchLoanSummary = useCallback(async () => {
        try {
            setError(null);
            const response = await loanAPI.getLoanSummary();
            setLoanSummary(response.data);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Create a new loan application
     */
    const createLoanApplication = useCallback(async (loanData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await loanAPI.createLoanApplication(loanData);
            
            // Refresh loans after creating application
            await fetchLoans();
            
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchLoans]);

    /**
     * Update a loan application
     */
    const updateLoanApplication = useCallback(async (loanId, loanData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await loanAPI.updateLoanApplication(loanId, loanData);
            
            // Update local state
            setLoans(prevLoans => 
                prevLoans.map(loan => 
                    loan.id === loanId ? { ...loan, ...response.data } : loan
                )
            );
            
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Make a loan payment
     */
    const makeLoanPayment = useCallback(async (loanId, amount) => {
        try {
            setLoading(true);
            setError(null);
            const response = await loanAPI.makeLoanPayment(loanId, { amount });
            
            // Update local state with new loan data
            setLoans(prevLoans => 
                prevLoans.map(loan => 
                    loan.id === loanId ? { ...loan, ...response.data.loan } : loan
                )
            );
            
            // Refresh summary after payment
            await fetchLoanSummary();
            
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchLoanSummary]);

    /**
     * Calculate loan payment (for calculator)
     */
    const calculateLoanPayment = useCallback(async (calculationData) => {
        try {
            setError(null);
            const response = await loanAPI.calculateLoanPayment(calculationData);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Get a specific loan by ID
     */
    const getLoanById = useCallback(async (loanId) => {
        try {
            setError(null);
            const response = await loanAPI.getLoan(loanId);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Initialize loan data on hook mount
     */
    useEffect(() => {
        fetchLoans();
        fetchLoanSummary();
    }, [fetchLoans, fetchLoanSummary]);

    return {
        // State
        loans,
        loanSummary,
        loading,
        error,
        
        // Actions
        fetchLoans,
        fetchLoanSummary,
        createLoanApplication,
        updateLoanApplication,
        makeLoanPayment,
        calculateLoanPayment,
        getLoanById,
        
        // Utilities
        clearError: () => setError(null)
    };
};

/**
 * Custom hook for loan applications management
 */
export const useLoanApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch loan applications (all statuses)
     */
    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await loanAPI.getLoans();
            setApplications(response.data.loans);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    return {
        applications,
        loading,
        error,
        fetchApplications,
        clearError: () => setError(null)
    };
};

/**
 * Custom hook for loan calculator
 */
export const useLoanCalculator = () => {
    const [calculation, setCalculation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculate = useCallback(async (loanData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await loanAPI.calculateLoanPayment(loanData);
            setCalculation(response);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearCalculation = useCallback(() => {
        setCalculation(null);
        setError(null);
    }, []);

    return {
        calculation,
        loading,
        error,
        calculate,
        clearCalculation,
        clearError: () => setError(null)
    };
};
