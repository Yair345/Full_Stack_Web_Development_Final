const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { LOAN_TYPES, LOAN_STATUS } = require('../utils/constants');

class Loan extends Model {
    /**
     * Check if loan is pending
     * @returns {Boolean} Is pending
     */
    isPending() {
        return this.status === LOAN_STATUS.PENDING;
    }

    /**
     * Check if loan is approved
     * @returns {Boolean} Is approved
     */
    isApproved() {
        return this.status === LOAN_STATUS.APPROVED;
    }

    /**
     * Check if loan is rejected
     * @returns {Boolean} Is rejected
     */
    isRejected() {
        return this.status === LOAN_STATUS.REJECTED;
    }

    /**
     * Check if loan is active
     * @returns {Boolean} Is active
     */
    isActive() {
        return this.status === LOAN_STATUS.ACTIVE;
    }

    /**
     * Check if loan is paid off
     * @returns {Boolean} Is paid off
     */
    isPaidOff() {
        return this.status === LOAN_STATUS.PAID_OFF;
    }

    /**
     * Check if loan is in default
     * @returns {Boolean} Is in default
     */
    isDefaulted() {
        return this.status === LOAN_STATUS.DEFAULTED;
    }

    /**
     * Calculate monthly payment amount
     * @returns {Number} Monthly payment
     */
    calculateMonthlyPayment() {
        const principal = parseFloat(this.amount) || 0;
        const monthlyRate = (parseFloat(this.interest_rate) || 0) / 12;
        const numberOfPayments = parseInt(this.term_months) || 0;

        if (principal <= 0 || numberOfPayments <= 0) {
            return 0;
        }

        if (monthlyRate === 0) {
            return Math.round((principal / numberOfPayments) * 100) / 100;
        }

        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        return isNaN(monthlyPayment) ? 0 : Math.round(monthlyPayment * 100) / 100;
    }

    /**
     * Calculate total interest over loan term
     * @returns {Number} Total interest
     */
    calculateTotalInterest() {
        const monthlyPayment = this.calculateMonthlyPayment();
        const termMonths = parseInt(this.term_months) || 0;
        const principal = parseFloat(this.amount) || 0;

        if (monthlyPayment === 0 || termMonths === 0 || principal === 0) {
            return 0;
        }

        const totalPayments = monthlyPayment * termMonths;
        const totalInterest = totalPayments - principal;

        return isNaN(totalInterest) ? 0 : Math.round(totalInterest * 100) / 100;
    }

    /**
     * Calculate remaining balance
     * @returns {Number} Remaining balance
     */
    calculateRemainingBalance() {
        if (!this.isActive()) {
            return 0;
        }

        const principal = parseFloat(this.amount) || 0;
        const monthlyRate = (parseFloat(this.interest_rate) || 0) / 12;
        const totalPayments = parseInt(this.term_months) || 0;
        const paymentsMade = parseInt(this.payments_made) || 0;

        if (principal <= 0 || totalPayments <= 0) {
            return 0;
        }

        if (paymentsMade >= totalPayments) {
            return 0;
        }

        if (monthlyRate === 0) {
            const remainingBalance = principal - (principal / totalPayments * paymentsMade);
            return Math.max(0, Math.round(remainingBalance * 100) / 100);
        }

        const monthlyPayment = this.calculateMonthlyPayment();
        const remainingBalance = principal * Math.pow(1 + monthlyRate, paymentsMade) -
            monthlyPayment * ((Math.pow(1 + monthlyRate, paymentsMade) - 1) / monthlyRate);

        const finalBalance = isNaN(remainingBalance) ? principal : Math.max(0, Math.round(remainingBalance * 100) / 100);
        return finalBalance;
    }

    /**
     * Calculate next payment due date
     * @returns {Date|null} Next payment due date
     */
    getNextPaymentDue() {
        if (!this.isActive() || !this.first_payment_date) {
            return null;
        }

        const firstPayment = new Date(this.first_payment_date);
        const paymentsMade = parseInt(this.payments_made) || 0;
        const nextPaymentDate = new Date(firstPayment);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + paymentsMade);

        // Check if loan is fully paid
        if (paymentsMade >= parseInt(this.term_months)) {
            return null;
        }

        return nextPaymentDate;
    }

    /**
     * Check if payment is overdue
     * @returns {Boolean} Is overdue
     */
    isOverdue() {
        const nextPaymentDue = this.getNextPaymentDue();
        if (!nextPaymentDue) {
            return false;
        }

        const today = new Date();
        return nextPaymentDue < today;
    }

    /**
     * Get days overdue
     * @returns {Number} Days overdue (0 if not overdue)
     */
    getDaysOverdue() {
        if (!this.isOverdue()) {
            return 0;
        }

        const nextPaymentDue = this.getNextPaymentDue();
        const today = new Date();
        const diffTime = today - nextPaymentDue;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Calculate loan progress percentage
     * @returns {Number} Progress percentage
     */
    getProgressPercentage() {
        if (!this.isActive()) {
            return this.isPaidOff() ? 100 : 0;
        }

        const paymentsMade = parseInt(this.payments_made) || 0;
        const totalPayments = parseInt(this.term_months) || 0;

        if (totalPayments === 0) {
            return 0;
        }

        const percentage = (paymentsMade / totalPayments) * 100;
        return isNaN(percentage) ? 0 : Math.round(percentage);
    }
}

Loan.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        validate: {
            notEmpty: {
                msg: 'User ID is required'
            }
        }
    },

    // Branch assignment (without foreign key constraint)
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Branch where the loan application was submitted'
        // Note: No foreign key constraint - just a simple integer field
    },

    loan_type: {
        type: DataTypes.ENUM(
            LOAN_TYPES.PERSONAL,
            LOAN_TYPES.MORTGAGE,
            LOAN_TYPES.AUTO,
            LOAN_TYPES.BUSINESS
        ),
        allowNull: false,
        validate: {
            isIn: {
                args: [Object.values(LOAN_TYPES)],
                msg: 'Invalid loan type'
            }
        }
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            isDecimal: {
                msg: 'Loan amount must be a valid decimal number'
            },
            min: {
                args: [1000.00],
                msg: 'Loan amount must be at least $1,000'
            },
            max: {
                args: [10000000.00],
                msg: 'Loan amount cannot exceed $10,000,000'
            }
        },
        get() {
            const value = this.getDataValue('amount');
            return value ? parseFloat(value) : 0.00;
        }
    },
    interest_rate: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
        validate: {
            isDecimal: {
                msg: 'Interest rate must be a valid decimal number'
            },
            min: {
                args: [0.0001],
                msg: 'Interest rate must be greater than 0'
            },
            max: {
                args: [0.5000],
                msg: 'Interest rate cannot exceed 50%'
            }
        },
        get() {
            const value = this.getDataValue('interest_rate');
            return value ? parseFloat(value) : 0.0000;
        }
    },
    term_months: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: 'Loan term must be an integer'
            },
            min: {
                args: [6],
                msg: 'Loan term must be at least 6 months'
            },
            max: {
                args: [480],
                msg: 'Loan term cannot exceed 480 months (40 years)'
            }
        }
    },
    monthly_payment: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            isDecimal: {
                msg: 'Monthly payment must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Monthly payment cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('monthly_payment');
            return value ? parseFloat(value) : 0.00;
        }
    },
    status: {
        type: DataTypes.ENUM(
            LOAN_STATUS.PENDING,
            LOAN_STATUS.APPROVED,
            LOAN_STATUS.REJECTED,
            LOAN_STATUS.ACTIVE,
            LOAN_STATUS.PAID_OFF,
            LOAN_STATUS.DEFAULTED
        ),
        allowNull: false,
        defaultValue: LOAN_STATUS.PENDING,
        validate: {
            isIn: {
                args: [Object.values(LOAN_STATUS)],
                msg: 'Invalid loan status'
            }
        }
    },
    purpose: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Loan purpose cannot be empty'
            },
            len: {
                args: [10, 1000],
                msg: 'Loan purpose must be between 10 and 1000 characters'
            }
        }
    },
    collateral_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 1000],
                msg: 'Collateral description cannot exceed 1000 characters'
            }
        }
    },
    collateral_value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        validate: {
            isDecimal: {
                msg: 'Collateral value must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Collateral value cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('collateral_value');
            return value ? parseFloat(value) : null;
        }
    },
    application_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    approval_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    disbursement_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    first_payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    final_payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    payments_made: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Payments made cannot be negative'
            }
        }
    },
    total_paid: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Total paid must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Total paid cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('total_paid');
            return value ? parseFloat(value) : 0.00;
        }
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    credit_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: {
                args: [300],
                msg: 'Credit score cannot be less than 300'
            },
            max: {
                args: [850],
                msg: 'Credit score cannot exceed 850'
            }
        }
    },
    debt_to_income_ratio: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            isDecimal: {
                msg: 'Debt to income ratio must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Debt to income ratio cannot be negative'
            },
            max: {
                args: [100],
                msg: 'Debt to income ratio cannot exceed 100%'
            }
        },
        get() {
            const value = this.getDataValue('debt_to_income_ratio');
            return value ? parseFloat(value) : null;
        }
    },
    annual_income: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: {
            isDecimal: {
                msg: 'Annual income must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Annual income cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('annual_income');
            return value ? parseFloat(value) : null;
        }
    }
}, {
    sequelize,
    modelName: 'Loan',
    tableName: 'loans',
    timestamps: true,
    paranoid: true, // Enables soft deletes
    hooks: {
        beforeUpdate: (loan) => {
            // Calculate monthly payment when loan is approved
            if (loan.changed('status') && loan.status === LOAN_STATUS.APPROVED && !loan.monthly_payment) {
                loan.monthly_payment = loan.calculateMonthlyPayment();
            }

            // Set approval date when status changes to approved
            if (loan.changed('status') && loan.status === LOAN_STATUS.APPROVED && !loan.approval_date) {
                loan.approval_date = new Date();
            }

            // Set disbursement date when status changes to active
            if (loan.changed('status') && loan.status === LOAN_STATUS.ACTIVE && !loan.disbursement_date) {
                loan.disbursement_date = new Date();

                // Set first payment date to next month
                if (!loan.first_payment_date) {
                    const firstPayment = new Date();
                    firstPayment.setMonth(firstPayment.getMonth() + 1);
                    loan.first_payment_date = firstPayment;
                }
            }
        }
    },
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['loan_type']
        },
        {
            fields: ['status']
        },
        {
            fields: ['application_date']
        },
        {
            fields: ['approval_date']
        },
        {
            fields: ['amount']
        },
        {
            fields: ['approved_by']
        },
        {
            fields: ['first_payment_date']
        }
    ],
    validate: {
        approvalValidation() {
            if (this.status === LOAN_STATUS.APPROVED && !this.approved_by) {
                throw new Error('Approved loans must have an approver');
            }

            if (this.status === LOAN_STATUS.REJECTED && !this.rejection_reason) {
                throw new Error('Rejected loans must have a rejection reason');
            }
        },
        dateValidation() {
            if (this.first_payment_date && this.disbursement_date) {
                if (new Date(this.first_payment_date) <= new Date(this.disbursement_date)) {
                    throw new Error('First payment date must be after disbursement date');
                }
            }
        },
        paymentValidation() {
            if (this.payments_made > this.term_months) {
                throw new Error('Payments made cannot exceed total loan term');
            }
        }
    }
});

module.exports = Loan;
