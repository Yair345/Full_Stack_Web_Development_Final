const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class BranchStatistics extends Model {
    /**
     * Calculate growth rate from previous period
     * @param {Object} previousStats - Previous period statistics
     * @returns {Object} Growth rates
     */
    calculateGrowthRates(previousStats) {
        if (!previousStats) return {};

        const calculateRate = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        return {
            customersGrowth: calculateRate(this.total_customers, previousStats.total_customers),
            accountsGrowth: calculateRate(this.active_accounts, previousStats.active_accounts),
            depositsGrowth: calculateRate(this.total_deposits, previousStats.total_deposits),
            loansGrowth: calculateRate(this.total_loans, previousStats.total_loans),
            revenueGrowth: calculateRate(this.revenue, previousStats.revenue)
        };
    }

    /**
     * Get net cash flow (deposits - withdrawals)
     * @returns {Number} Net cash flow
     */
    getNetCashFlow() {
        return parseFloat(this.total_deposits) - parseFloat(this.total_withdrawals);
    }

    /**
     * Calculate customer satisfaction percentage
     * @returns {Number} Satisfaction percentage (0-100)
     */
    getSatisfactionPercentage() {
        if (!this.customer_satisfaction_score) return 0;
        return (this.customer_satisfaction_score / 5) * 100; // Assuming 5-star rating
    }

    /**
     * Get performance metrics summary
     * @returns {Object} Performance summary
     */
    getPerformanceSummary() {
        return {
            date: this.date,
            totalCustomers: this.total_customers,
            newCustomers: this.new_customers_today,
            activeAccounts: this.active_accounts,
            netCashFlow: this.getNetCashFlow(),
            pendingLoans: this.pending_loan_applications,
            dailyTransactions: this.transactions_count,
            dailyRevenue: this.revenue,
            satisfactionScore: this.customer_satisfaction_score,
            satisfactionPercentage: this.getSatisfactionPercentage()
        };
    }
}

BranchStatistics.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Branch ID is required'
            },
            isInt: {
                msg: 'Branch ID must be an integer'
            }
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'Date must be a valid date'
            }
        }
    },
    total_customers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Total customers cannot be negative'
            }
        }
    },
    new_customers_today: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'New customers today cannot be negative'
            }
        }
    },
    active_accounts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Active accounts cannot be negative'
            }
        }
    },
    total_deposits: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Total deposits must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Total deposits cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('total_deposits');
            return value ? parseFloat(value) : 0.00;
        }
    },
    total_withdrawals: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Total withdrawals must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Total withdrawals cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('total_withdrawals');
            return value ? parseFloat(value) : 0.00;
        }
    },
    total_loans: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Total loans must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Total loans cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('total_loans');
            return value ? parseFloat(value) : 0.00;
        }
    },
    pending_loan_applications: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Pending loan applications cannot be negative'
            }
        }
    },
    transactions_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Transactions count cannot be negative'
            }
        }
    },
    revenue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Revenue must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Revenue cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('revenue');
            return value ? parseFloat(value) : 0.00;
        }
    },
    customer_satisfaction_score: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
            min: {
                args: [1],
                msg: 'Customer satisfaction score must be at least 1'
            },
            max: {
                args: [5],
                msg: 'Customer satisfaction score cannot exceed 5'
            }
        },
        get() {
            const value = this.getDataValue('customer_satisfaction_score');
            return value ? parseFloat(value) : null;
        }
    }
}, {
    sequelize,
    modelName: 'BranchStatistics',
    tableName: 'branch_statistics',
    timestamps: true,
    paranoid: false, // No soft deletes for statistics
    indexes: [
        {
            unique: true,
            name: 'unique_branch_date',
            fields: ['branch_id', 'date']
        },
        {
            fields: ['branch_id']
        },
        {
            fields: ['date']
        },
        {
            fields: ['created_at']
        }
    ]
});

module.exports = BranchStatistics;
