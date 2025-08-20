const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { STANDING_ORDER_FREQUENCIES, STANDING_ORDER_STATUS } = require('../utils/constants');

class StandingOrder extends Model {
    /**
     * Check if standing order is active
     * @returns {Boolean} Is active
     */
    isActive() {
        return this.status === STANDING_ORDER_STATUS.ACTIVE;
    }

    /**
     * Check if standing order is paused
     * @returns {Boolean} Is paused
     */
    isPaused() {
        return this.status === STANDING_ORDER_STATUS.PAUSED;
    }

    /**
     * Check if standing order is cancelled
     * @returns {Boolean} Is cancelled
     */
    isCancelled() {
        return this.status === STANDING_ORDER_STATUS.CANCELLED;
    }

    /**
     * Check if standing order is completed
     * @returns {Boolean} Is completed
     */
    isCompleted() {
        return this.status === STANDING_ORDER_STATUS.COMPLETED;
    }

    /**
     * Calculate next execution date
     * @returns {Date|null} Next execution date
     */
    getNextExecutionDate() {
        if (!this.isActive() || !this.next_execution_date) {
            return null;
        }

        return new Date(this.next_execution_date);
    }

    /**
     * Check if standing order is due for execution
     * @returns {Boolean} Is due
     */
    isDueForExecution() {
        const nextExecution = this.getNextExecutionDate();
        if (!nextExecution) {
            return false;
        }

        const now = new Date();
        return nextExecution <= now;
    }

    /**
     * Calculate next execution date based on frequency
     * @param {Date} fromDate - Date to calculate from
     * @returns {Date} Next execution date
     */
    calculateNextExecutionDate(fromDate = new Date()) {
        const baseDate = new Date(fromDate);

        switch (this.frequency) {
            case STANDING_ORDER_FREQUENCIES.DAILY:
                baseDate.setDate(baseDate.getDate() + 1);
                break;
            case STANDING_ORDER_FREQUENCIES.WEEKLY:
                baseDate.setDate(baseDate.getDate() + 7);
                break;
            case STANDING_ORDER_FREQUENCIES.MONTHLY:
                baseDate.setMonth(baseDate.getMonth() + 1);
                break;
            case STANDING_ORDER_FREQUENCIES.QUARTERLY:
                baseDate.setMonth(baseDate.getMonth() + 3);
                break;
            case STANDING_ORDER_FREQUENCIES.YEARLY:
                baseDate.setFullYear(baseDate.getFullYear() + 1);
                break;
            default:
                throw new Error('Invalid frequency');
        }

        return baseDate;
    }

    /**
     * Check if standing order should stop
     * @returns {Boolean} Should stop
     */
    shouldStop() {
        // Check if end date has passed
        if (this.end_date && new Date(this.end_date) < new Date()) {
            return true;
        }

        // Check if max executions reached
        if (this.max_executions && this.executions_count >= this.max_executions) {
            return true;
        }

        return false;
    }

    /**
     * Get total amount transferred
     * @returns {Number} Total transferred
     */
    getTotalTransferred() {
        return parseFloat(this.amount) * (this.executions_count || 0);
    }

    /**
     * Get remaining executions
     * @returns {Number|null} Remaining executions (null if unlimited)
     */
    getRemainingExecutions() {
        if (!this.max_executions) {
            return null;
        }

        return Math.max(0, this.max_executions - (this.executions_count || 0));
    }

    /**
     * Check if standing order is recurring indefinitely
     * @returns {Boolean} Is indefinite
     */
    isIndefinite() {
        return !this.end_date && !this.max_executions;
    }

    /**
     * Get days until next execution
     * @returns {Number|null} Days until next execution
     */
    getDaysUntilNextExecution() {
        const nextExecution = this.getNextExecutionDate();
        if (!nextExecution) {
            return null;
        }

        const now = new Date();
        const diffTime = nextExecution - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

StandingOrder.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    from_account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        },
        validate: {
            notEmpty: {
                msg: 'Source account ID is required'
            }
        }
    },
    to_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    external_account_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
            len: {
                args: [0, 50],
                msg: 'External account number cannot exceed 50 characters'
            }
        }
    },
    beneficiary_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Beneficiary name cannot be empty'
            },
            len: {
                args: [2, 100],
                msg: 'Beneficiary name must be between 2 and 100 characters'
            }
        }
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            isDecimal: {
                msg: 'Amount must be a valid decimal number'
            },
            min: {
                args: [0.01],
                msg: 'Amount must be at least 0.01'
            },
            max: {
                args: [1000000.00],
                msg: 'Amount cannot exceed $1,000,000'
            }
        },
        get() {
            const value = this.getDataValue('amount');
            return value ? parseFloat(value) : 0.00;
        }
    },
    frequency: {
        type: DataTypes.ENUM(
            STANDING_ORDER_FREQUENCIES.DAILY,
            STANDING_ORDER_FREQUENCIES.WEEKLY,
            STANDING_ORDER_FREQUENCIES.MONTHLY,
            STANDING_ORDER_FREQUENCIES.QUARTERLY,
            STANDING_ORDER_FREQUENCIES.YEARLY
        ),
        allowNull: false,
        validate: {
            isIn: {
                args: [Object.values(STANDING_ORDER_FREQUENCIES)],
                msg: 'Invalid frequency'
            }
        }
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'Start date must be a valid date'
            },
            notEmpty: {
                msg: 'Start date is required'
            }
        }
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'End date must be a valid date'
            },
            isAfterStartDate(value) {
                if (value && this.start_date && new Date(value) <= new Date(this.start_date)) {
                    throw new Error('End date must be after start date');
                }
            }
        }
    },
    next_execution_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'Next execution date must be a valid date'
            }
        }
    },
    max_executions: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            isInt: {
                msg: 'Max executions must be an integer'
            },
            min: {
                args: [1],
                msg: 'Max executions must be at least 1'
            },
            max: {
                args: [10000],
                msg: 'Max executions cannot exceed 10,000'
            }
        }
    },
    executions_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Executions count cannot be negative'
            }
        }
    },
    status: {
        type: DataTypes.ENUM(
            STANDING_ORDER_STATUS.ACTIVE,
            STANDING_ORDER_STATUS.PAUSED,
            STANDING_ORDER_STATUS.CANCELLED,
            STANDING_ORDER_STATUS.COMPLETED
        ),
        allowNull: false,
        defaultValue: STANDING_ORDER_STATUS.ACTIVE,
        validate: {
            isIn: {
                args: [Object.values(STANDING_ORDER_STATUS)],
                msg: 'Invalid standing order status'
            }
        }
    },
    reference: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: {
                args: [0, 100],
                msg: 'Reference cannot exceed 100 characters'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 500],
                msg: 'Description cannot exceed 500 characters'
            }
        }
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    last_execution_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_execution_status: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    failure_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Failure count cannot be negative'
            }
        }
    },
    last_failure_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'StandingOrder',
    tableName: 'standing_orders',
    timestamps: true,
    paranoid: true, // Enables soft deletes
    hooks: {
        beforeCreate: (standingOrder) => {
            // Set initial next execution date if not provided
            if (!standingOrder.next_execution_date) {
                standingOrder.next_execution_date = standingOrder.start_date;
            }
        },
        beforeUpdate: (standingOrder) => {
            // Auto-complete if conditions are met
            if (standingOrder.shouldStop() && standingOrder.status === STANDING_ORDER_STATUS.ACTIVE) {
                standingOrder.status = STANDING_ORDER_STATUS.COMPLETED;
            }

            // Auto-pause if too many failures
            if (standingOrder.failure_count >= 3 && standingOrder.status === STANDING_ORDER_STATUS.ACTIVE) {
                standingOrder.status = STANDING_ORDER_STATUS.PAUSED;
            }
        }
    },
    indexes: [
        {
            fields: ['from_account_id']
        },
        {
            fields: ['to_account_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['next_execution_date']
        },
        {
            fields: ['created_by']
        }
    ],
    validate: {
        accountValidation() {
            // Either to_account_id or external_account_number must be provided
            if (!this.to_account_id && !this.external_account_number) {
                throw new Error('Either internal account or external account number must be provided');
            }

            // Cannot transfer to same account
            if (this.to_account_id === this.from_account_id) {
                throw new Error('Cannot create standing order to the same account');
            }
        },
        executionValidation() {
            // Executions count cannot exceed max executions
            if (this.max_executions && this.executions_count > this.max_executions) {
                throw new Error('Executions count cannot exceed maximum executions');
            }
        },
        dateValidation() {
            // Next execution date should be reasonable
            if (this.next_execution_date && this.start_date) {
                const nextExec = new Date(this.next_execution_date);
                const startDate = new Date(this.start_date);

                if (nextExec < startDate) {
                    throw new Error('Next execution date cannot be before start date');
                }
            }
        }
    }
});

module.exports = StandingOrder;
