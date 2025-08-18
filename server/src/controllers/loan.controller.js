const { Loan, User } = require('../models');
const { LOAN_STATUS, LOAN_TYPES, HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/error.utils');
const { validateLoanApplication, validateLoanUpdate } = require('../utils/validation.utils');

/**
 * Get all loans for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLoans = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, type, page = 1, limit = 20 } = req.query;

        const whereClause = { user_id: userId };
        
        if (status) {
            whereClause.status = status;
        }
        
        if (type) {
            whereClause.loan_type = type;
        }

        const offset = (page - 1) * limit;

        const loans = await Loan.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'borrower',
                    attributes: ['id', 'first_name', 'last_name'],
                    required: true
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'first_name', 'last_name'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Add calculated fields to each loan
        const loansWithCalculations = loans.rows.map(loan => {
            const loanData = loan.toJSON();
            return {
                ...loanData,
                monthlyPayment: loan.calculateMonthlyPayment(),
                totalInterest: loan.calculateTotalInterest(),
                remainingBalance: loan.calculateRemainingBalance(),
                nextPaymentDue: loan.getNextPaymentDue(),
                isOverdue: loan.isOverdue(),
                daysOverdue: loan.getDaysOverdue(),
                progressPercentage: loan.getProgressPercentage()
            };
        });

        res.json({
            success: true,
            data: {
                loans: loansWithCalculations,
                pagination: {
                    total: loans.count,
                    pages: Math.ceil(loans.count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching loans:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: error.message
        });
    }
};

/**
 * Get a specific loan by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const loan = await Loan.findOne({
            where: { 
                id,
                user_id: userId 
            },
            include: [
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'first_name', 'last_name'],
                    required: false
                }
            ]
        });

        if (!loan) {
            throw new NotFoundError('Loan not found');
        }

        // Add calculated fields
        const loanData = loan.toJSON();
        const loanWithCalculations = {
            ...loanData,
            monthlyPayment: loan.calculateMonthlyPayment(),
            totalInterest: loan.calculateTotalInterest(),
            remainingBalance: loan.calculateRemainingBalance(),
            nextPaymentDue: loan.getNextPaymentDue(),
            isOverdue: loan.isOverdue(),
            daysOverdue: loan.getDaysOverdue(),
            progressPercentage: loan.getProgressPercentage()
        };

        res.json({
            success: true,
            data: loanWithCalculations
        });
    } catch (error) {
        console.error('Error fetching loan:', error);
        
        if (error instanceof NotFoundError) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: error.message
            });
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: error.message
        });
    }
};

/**
 * Create a new loan application
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createLoanApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Validate loan application data
        const validationResult = validateLoanApplication(req.body);
        if (!validationResult.isValid) {
            throw new ValidationError('Invalid loan application data', validationResult.errors);
        }

        const {
            loan_type,
            amount,
            interest_rate,
            term_months,
            purpose,
            collateral_description,
            collateral_value,
            credit_score,
            debt_to_income_ratio,
            annual_income
        } = req.body;

        // Create the loan application
        const loan = await Loan.create({
            user_id: userId,
            loan_type,
            amount,
            interest_rate,
            term_months,
            purpose,
            collateral_description,
            collateral_value,
            credit_score,
            debt_to_income_ratio,
            annual_income,
            status: LOAN_STATUS.PENDING,
            application_date: new Date()
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Loan application submitted successfully',
            data: loan
        });
    } catch (error) {
        console.error('Error creating loan application:', error);
        
        if (error instanceof ValidationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message,
                errors: error.errors
            });
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: error.message
        });
    }
};

/**
 * Update loan application (only for pending loans)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLoanApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const loan = await Loan.findOne({
            where: { 
                id,
                user_id: userId,
                status: LOAN_STATUS.PENDING
            }
        });

        if (!loan) {
            throw new NotFoundError('Pending loan application not found');
        }

        // Validate update data
        const validationResult = validateLoanUpdate(req.body);
        if (!validationResult.isValid) {
            throw new ValidationError('Invalid loan update data', validationResult.errors);
        }

        // Update the loan
        await loan.update(req.body);

        res.json({
            success: true,
            message: 'Loan application updated successfully',
            data: loan
        });
    } catch (error) {
        console.error('Error updating loan application:', error);
        
        if (error instanceof NotFoundError) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: error.message
            });
        }

        if (error instanceof ValidationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message,
                errors: error.errors
            });
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: error.message
        });
    }
};

/**
 * Make a loan payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const makeLoanPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            throw new ValidationError('Payment amount must be greater than 0');
        }

        const loan = await Loan.findOne({
            where: { 
                id,
                user_id: userId,
                status: LOAN_STATUS.ACTIVE
            }
        });

        if (!loan) {
            throw new NotFoundError('Active loan not found');
        }

        const paymentAmount = parseFloat(amount);
        const currentBalance = loan.calculateRemainingBalance();

        if (paymentAmount > currentBalance) {
            throw new ValidationError('Payment amount cannot exceed remaining balance');
        }

        // Update loan payment information
        const newPaymentsMade = (loan.payments_made || 0) + 1;
        const newTotalPaid = (loan.total_paid || 0) + paymentAmount;

        await loan.update({
            payments_made: newPaymentsMade,
            total_paid: newTotalPaid,
            status: paymentAmount >= currentBalance ? LOAN_STATUS.PAID_OFF : LOAN_STATUS.ACTIVE
        });

        // Add calculated fields for response
        const loanData = loan.toJSON();
        const loanWithCalculations = {
            ...loanData,
            remainingBalance: loan.calculateRemainingBalance(),
            nextPaymentDue: loan.getNextPaymentDue(),
            progressPercentage: loan.getProgressPercentage()
        };

        res.json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                loan: loanWithCalculations,
                payment: {
                    amount: paymentAmount,
                    remainingBalance: loan.calculateRemainingBalance(),
                    paidOff: loan.status === LOAN_STATUS.PAID_OFF
                }
            }
        });
    } catch (error) {
        console.error('Error processing loan payment:', error);
        
        if (error instanceof NotFoundError) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: error.message
            });
        }

        if (error instanceof ValidationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: error.message
        });
    }
};

/**
 * Get loan summary/statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLoanSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const loans = await Loan.findAll({
            where: { user_id: userId }
        });

        const summary = {
            totalLoans: loans.length,
            activeLoans: loans.filter(loan => loan.status === LOAN_STATUS.ACTIVE).length,
            pendingApplications: loans.filter(loan => loan.status === LOAN_STATUS.PENDING).length,
            totalBorrowed: loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0),
            totalOwed: 0,
            monthlyPayments: 0,
            averageInterestRate: 0
        };

        // Calculate totals for active loans
        const activeLoans = loans.filter(loan => loan.status === LOAN_STATUS.ACTIVE);
        
        if (activeLoans.length > 0) {
            summary.totalOwed = activeLoans.reduce((sum, loan) => sum + loan.calculateRemainingBalance(), 0);
            summary.monthlyPayments = activeLoans.reduce((sum, loan) => sum + loan.calculateMonthlyPayment(), 0);
            summary.averageInterestRate = activeLoans.reduce((sum, loan) => sum + parseFloat(loan.interest_rate), 0) / activeLoans.length;
        }

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error fetching loan summary:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: error.message
        });
    }
};

/**
 * Calculate loan payment (for loan calculator)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const calculateLoanPayment = async (req, res) => {
    try {
        const { amount, interest_rate, term_months } = req.body;

        if (!amount || !interest_rate || !term_months) {
            throw new ValidationError('Amount, interest rate, and term are required');
        }

        const principal = parseFloat(amount);
        const monthlyRate = parseFloat(interest_rate) / 12; // Convert to decimal and monthly
        const numberOfPayments = parseInt(term_months);

        if (principal <= 0 || monthlyRate < 0 || numberOfPayments <= 0) {
            throw new ValidationError('Invalid calculation parameters');
        }

        let monthlyPayment = 0;
        let totalInterest = 0;
        let totalAmount = 0;

        if (monthlyRate === 0) {
            monthlyPayment = principal / numberOfPayments;
        } else {
            monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }

        totalAmount = monthlyPayment * numberOfPayments;
        totalInterest = totalAmount - principal;

        res.json({
            success: true,
            data: {
                monthlyPayment: Math.round(monthlyPayment * 100) / 100,
                totalAmount: Math.round(totalAmount * 100) / 100,
                totalInterest: Math.round(totalInterest * 100) / 100,
                principal,
                interestRate: parseFloat(interest_rate),
                termMonths: numberOfPayments
            }
        });
    } catch (error) {
        console.error('Error calculating loan payment:', error);
        
        if (error instanceof ValidationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: error.message
        });
    }
};

/**
 * Admin function: Approve or reject loan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLoanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;
        const approverId = req.user.id;

        const loan = await Loan.findByPk(id);

        if (!loan) {
            throw new NotFoundError('Loan not found');
        }

        if (loan.status !== LOAN_STATUS.PENDING) {
            throw new ValidationError('Only pending loans can be approved or rejected');
        }

        const updateData = { status };

        if (status === LOAN_STATUS.APPROVED) {
            updateData.approved_by = approverId;
            updateData.approval_date = new Date();
        } else if (status === LOAN_STATUS.REJECTED) {
            if (!rejection_reason) {
                throw new ValidationError('Rejection reason is required');
            }
            updateData.rejection_reason = rejection_reason;
        }

        await loan.update(updateData);

        res.json({
            success: true,
            message: `Loan ${status} successfully`,
            data: loan
        });
    } catch (error) {
        console.error('Error updating loan status:', error);
        
        if (error instanceof NotFoundError) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: error.message
            });
        }

        if (error instanceof ValidationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: error.message
        });
    }
};

module.exports = {
    getLoans,
    getLoan,
    createLoanApplication,
    updateLoanApplication,
    makeLoanPayment,
    getLoanSummary,
    calculateLoanPayment,
    updateLoanStatus
};
