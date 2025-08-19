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

            // Extract the updated loan data from the response
            const updatedLoan = response.data.loan;
            const paymentInfo = response.data.payment;

            // Update local state with comprehensive loan data
            setLoans(prevLoans =>
                prevLoans.map(loan => {
                    if (loan.id === loanId) {
                        return {
                            ...loan,
                            ...updatedLoan,
                            // Ensure key fields are properly updated
                            remaining_balance: updatedLoan.remainingBalance || paymentInfo.remainingBalance,
                            remainingBalance: updatedLoan.remainingBalance || paymentInfo.remainingBalance,
                            currentBalance: updatedLoan.remainingBalance || paymentInfo.remainingBalance,
                            nextPaymentDue: updatedLoan.nextPaymentDue,
                            nextPaymentDate: updatedLoan.nextPaymentDue,
                            payments_made: updatedLoan.payments_made,
                            total_paid: updatedLoan.total_paid,
                            status: updatedLoan.status,
                            progressPercentage: updatedLoan.progressPercentage,
                            // Calculate next payment date if not provided
                            nextPayment: updatedLoan.nextPaymentDue || calculateNextPaymentDate(loan)
                        };
                    }
                    return loan;
                })
            );

            // Refresh summary after payment to update totals
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
     * Helper function to calculate next payment date (fallback)
     */
    const calculateNextPaymentDate = (loan) => {
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        return nextMonth.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    };

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
     * Approve or reject a branch loan (for managers and admins)
     */
    const approveBranchLoan = useCallback(async (loanId, status, rejectionReason = null) => {
        try {
            setLoading(true);
            setError(null);

            const approvalData = { status };
            if (status === 'rejected' && rejectionReason) {
                approvalData.rejection_reason = rejectionReason;
            }

            const response = await loanAPI.approveBranchLoan(loanId, approvalData);

            // Update local state
            setLoans(prevLoans =>
                prevLoans.map(loan =>
                    loan.id === loanId ? { ...loan, status, ...(rejectionReason && { rejection_reason: rejectionReason }) } : loan
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
        approveBranchLoan,

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
