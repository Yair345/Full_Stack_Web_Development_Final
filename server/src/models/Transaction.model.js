const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { generateTransactionRef } = require('../utils/encryption.utils');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, CURRENCIES } = require('../utils/constants');

class Transaction extends Model {
    /**
     * Check if transaction is completed
     * @returns {Boolean} Is completed
     */
    isCompleted() {
        return this.status === TRANSACTION_STATUS.COMPLETED;
    }

    /**
     * Check if transaction is pending
     * @returns {Boolean} Is pending
     */
    isPending() {
        return this.status === TRANSACTION_STATUS.PENDING;
    }

    /**
     * Check if transaction has failed
     * @returns {Boolean} Has failed
     */
    hasFailed() {
        return this.status === TRANSACTION_STATUS.FAILED;
    }

    /**
     * Check if transaction was cancelled
     * @returns {Boolean} Was cancelled
     */
    wasCancelled() {
        return this.status === TRANSACTION_STATUS.CANCELLED;
    }

    /**
     * Check if transaction is internal (same bank)
     * @returns {Boolean} Is internal transfer
     */
    isInternalTransfer() {
        return this.transaction_type === TRANSACTION_TYPES.TRANSFER &&
            this.from_account_id && this.to_account_id;
    }

    /**
     * Check if transaction is external
     * @returns {Boolean} Is external transfer
     */
    isExternalTransfer() {
        return this.transaction_type === TRANSACTION_TYPES.TRANSFER &&
            (!this.from_account_id || !this.to_account_id);
    }

    /**
     * Check if transaction is a deposit
     * @returns {Boolean} Is deposit
     */
    isDeposit() {
        return this.transaction_type === TRANSACTION_TYPES.DEPOSIT;
    }

    /**
     * Check if transaction is a withdrawal
     * @returns {Boolean} Is withdrawal
     */
    isWithdrawal() {
        return this.transaction_type === TRANSACTION_TYPES.WITHDRAWAL;
    }

    /**
     * Check if transaction is a payment
     * @returns {Boolean} Is payment
     */
    isPayment() {
        return this.transaction_type === TRANSACTION_TYPES.PAYMENT;
    }

    /**
     * Check if transaction is a fee
     * @returns {Boolean} Is fee
     */
    isFee() {
        return this.transaction_type === TRANSACTION_TYPES.FEE;
    }

    /**
     * Get formatted amount with currency
     * @returns {String} Formatted amount
     */
    getFormattedAmount() {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.currency || 'USD'
        });
        return formatter.format(this.amount);
    }

    /**
     * Get transaction direction for an account
     * @param {Number} accountId - Account ID to check direction for
     * @returns {String} 'in', 'out', or 'unknown'
     */
    getDirectionForAccount(accountId) {
        if (this.to_account_id === accountId) {
            return 'in';
        } else if (this.from_account_id === accountId) {
            return 'out';
        }
        return 'unknown';
    }

    /**
     * Check if transaction can be cancelled
     * @returns {Boolean} Can be cancelled
     */
    canBeCancelled() {
        return this.status === TRANSACTION_STATUS.PENDING;
    }

    /**
     * Get processing time in milliseconds
     * @returns {Number|null} Processing time or null if not completed
     */
    getProcessingTime() {
        if (this.completed_at && this.createdAt) {
            return new Date(this.completed_at) - new Date(this.createdAt);
        }
        return null;
    }
}

Transaction.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    transaction_ref: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
            name: 'transaction_ref',
            msg: 'Transaction reference already exists'
        },
        validate: {
            notEmpty: {
                msg: 'Transaction reference cannot be empty'
            },
            len: {
                args: [5, 50],
                msg: 'Transaction reference must be between 5 and 50 characters'
            }
        }
    },
    from_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'accounts',
            key: 'id'
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
    transaction_type: {
        type: DataTypes.ENUM(
            TRANSACTION_TYPES.DEPOSIT,
            TRANSACTION_TYPES.WITHDRAWAL,
            TRANSACTION_TYPES.TRANSFER,
            TRANSACTION_TYPES.PAYMENT,
            TRANSACTION_TYPES.FEE
        ),
        allowNull: false,
        validate: {
            isIn: {
                args: [Object.values(TRANSACTION_TYPES)],
                msg: 'Invalid transaction type'
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
                args: [999999999999.99],
                msg: 'Amount cannot exceed maximum limit'
            }
        },
        get() {
            const value = this.getDataValue('amount');
            return value ? parseFloat(value) : 0.00;
        }
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: CURRENCIES.USD,
        validate: {
            isIn: {
                args: [Object.values(CURRENCIES)],
                msg: 'Currency must be a valid currency code'
            },
            len: {
                args: [3, 3],
                msg: 'Currency code must be exactly 3 characters'
            }
        }
    },
    status: {
        type: DataTypes.ENUM(
            TRANSACTION_STATUS.PENDING,
            TRANSACTION_STATUS.COMPLETED,
            TRANSACTION_STATUS.FAILED,
            TRANSACTION_STATUS.CANCELLED
        ),
        allowNull: false,
        defaultValue: TRANSACTION_STATUS.PENDING,
        validate: {
            isIn: {
                args: [Object.values(TRANSACTION_STATUS)],
                msg: 'Invalid transaction status'
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
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    external_reference: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: {
                args: [0, 100],
                msg: 'External reference cannot exceed 100 characters'
            }
        }
    },
    fee_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Fee amount must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Fee amount cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('fee_amount');
            return value ? parseFloat(value) : 0.00;
        }
    },
    exchange_rate: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        validate: {
            isDecimal: {
                msg: 'Exchange rate must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Exchange rate cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('exchange_rate');
            return value ? parseFloat(value) : null;
        }
    },
    initiated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    authorized_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    failed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    failure_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    balance_before: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        get() {
            const value = this.getDataValue('balance_before');
            return value ? parseFloat(value) : null;
        }
    },
    balance_after: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        get() {
            const value = this.getDataValue('balance_after');
            return value ? parseFloat(value) : null;
        }
    }
}, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    paranoid: false, // Transactions should never be deleted
    hooks: {
        beforeCreate: async (transaction) => {
            if (!transaction.transaction_ref) {
                // Generate transaction reference if not provided
                let transactionRef;
                let exists = true;

                while (exists) {
                    transactionRef = generateTransactionRef();
                    const existingTransaction = await Transaction.findOne({
                        where: { transaction_ref: transactionRef }
                    });
                    exists = !!existingTransaction;
                }

                transaction.transaction_ref = transactionRef;
            }
        },
        beforeUpdate: (transaction) => {
            // Set completion timestamp when status changes to completed
            if (transaction.changed('status') && transaction.status === TRANSACTION_STATUS.COMPLETED) {
                transaction.completed_at = new Date();
            }

            // Set failure timestamp when status changes to failed
            if (transaction.changed('status') && transaction.status === TRANSACTION_STATUS.FAILED) {
                transaction.failed_at = new Date();
            }
        }
    },
    indexes: [
        {
            unique: true,
            fields: ['transaction_ref']
        },
        {
            fields: ['from_account_id']
        },
        {
            fields: ['to_account_id']
        },
        {
            fields: ['transaction_type']
        },
        {
            fields: ['status']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['completed_at']
        },
        {
            fields: ['amount']
        },
        {
            fields: ['external_reference']
        },
        {
            fields: ['initiated_by']
        }
    ],
    validate: {
        accountValidation() {
            // For transfers, either from_account_id or to_account_id is required
            if (this.transaction_type === TRANSACTION_TYPES.TRANSFER) {
                if (!this.from_account_id && !this.to_account_id) {
                    throw new Error('Transfer transactions require at least one account');
                }
                if (this.from_account_id === this.to_account_id) {
                    throw new Error('Cannot transfer to the same account');
                }
            }

            // For deposits, to_account_id is required
            if (this.transaction_type === TRANSACTION_TYPES.DEPOSIT && !this.to_account_id) {
                throw new Error('Deposit transactions require a destination account');
            }

            // For withdrawals, from_account_id is required
            if (this.transaction_type === TRANSACTION_TYPES.WITHDRAWAL && !this.from_account_id) {
                throw new Error('Withdrawal transactions require a source account');
            }
        },
        statusValidation() {
            // Completed transactions must have completion timestamp
            if (this.status === TRANSACTION_STATUS.COMPLETED && !this.completed_at) {
                this.completed_at = new Date();
            }

            // Failed transactions must have failure timestamp
            if (this.status === TRANSACTION_STATUS.FAILED && !this.failed_at) {
                this.failed_at = new Date();
            }
        }
    }
});

/**
 * Generate unique reference number for transaction
 * @returns {String} Reference number
 */
Transaction.generateReferenceNumber = function () {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TXN${timestamp}${random}`;
};

module.exports = Transaction;
