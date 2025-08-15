const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { generateAccountNumber } = require('../utils/encryption.utils');
const { ACCOUNT_TYPES, ACCOUNT_STATUS, CURRENCIES } = require('../utils/constants');

class Account extends Model {
    /**
     * Check if account is active
     * @returns {Boolean} Is active
     */
    isActive() {
        return this.is_active;
    }

    /**
     * Check if account is frozen
     * @returns {Boolean} Is frozen
     */
    isFrozen() {
        return !this.is_active; // Assuming inactive means frozen/closed
    }

    /**
     * Check if account is closed
     * @returns {Boolean} Is closed
     */
    isClosed() {
        return !this.is_active; // Assuming inactive means frozen/closed
    }

    /**
     * Check if account has sufficient balance
     * @param {Number} amount - Amount to check
     * @returns {Boolean} Has sufficient balance
     */
    hasSufficientBalance(amount) {
        const availableBalance = this.balance + this.overdraft_limit;
        return availableBalance >= amount;
    }

    /**
     * Get available balance (including overdraft)
     * @returns {Number} Available balance
     */
    getAvailableBalance() {
        return this.balance + this.overdraft_limit;
    }

    /**
     * Format account number for display
     * @returns {String} Masked account number
     */
    getMaskedAccountNumber() {
        const accountNumber = this.account_number;
        return `****-****-${accountNumber.slice(-4)}`;
    }

    /**
     * Check if account type is checking
     * @returns {Boolean} Is checking account
     */
    isCheckingAccount() {
        return this.account_type === ACCOUNT_TYPES.CHECKING;
    }

    /**
     * Check if account type is savings
     * @returns {Boolean} Is savings account
     */
    isSavingsAccount() {
        return this.account_type === ACCOUNT_TYPES.SAVINGS;
    }

    /**
     * Check if account type is credit
     * @returns {Boolean} Is credit account
     */
    isCreditAccount() {
        return this.account_type === ACCOUNT_TYPES.CREDIT;
    }

    /**
     * Convert to JSON (mask sensitive data)
     * @returns {Object} Safe account object
     */
    toSafeJSON() {
        const account = this.toJSON();
        return {
            ...account,
            account_number: this.getMaskedAccountNumber()
        };
    }
}

Account.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    account_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: {
            name: 'account_number',
            msg: 'Account number already exists'
        },
        validate: {
            notEmpty: {
                msg: 'Account number cannot be empty'
            },
            len: {
                args: [10, 20],
                msg: 'Account number must be between 10 and 20 characters'
            }
        }
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
    account_type: {
        type: DataTypes.ENUM(ACCOUNT_TYPES.CHECKING, ACCOUNT_TYPES.SAVINGS, ACCOUNT_TYPES.CREDIT),
        allowNull: false,
        validate: {
            isIn: {
                args: [[ACCOUNT_TYPES.CHECKING, ACCOUNT_TYPES.SAVINGS, ACCOUNT_TYPES.CREDIT]],
                msg: 'Account type must be checking, savings, or credit'
            }
        }
    },
    balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Balance must be a valid decimal number'
            },
            min: {
                args: [-999999999999.99],
                msg: 'Balance cannot be less than minimum allowed'
            },
            max: {
                args: [999999999999.99],
                msg: 'Balance cannot exceed maximum allowed'
            }
        },
        get() {
            const value = this.getDataValue('balance');
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
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        validate: {
            isBoolean: {
                msg: 'is_active must be a boolean value'
            }
        }
    },
    overdraft_limit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Overdraft limit must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Overdraft limit cannot be negative'
            },
            max: {
                args: [50000.00],
                msg: 'Overdraft limit cannot exceed $50,000'
            }
        },
        get() {
            const value = this.getDataValue('overdraft_limit');
            return value ? parseFloat(value) : 0.00;
        }
    },
    interest_rate: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.0000,
        validate: {
            isDecimal: {
                msg: 'Interest rate must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Interest rate cannot be negative'
            },
            max: {
                args: [1],
                msg: 'Interest rate cannot exceed 100%'
            }
        },
        get() {
            const value = this.getDataValue('interest_rate');
            return value ? parseFloat(value) : 0.0000;
        }
    },
    monthly_fee: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Monthly fee must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Monthly fee cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('monthly_fee');
            return value ? parseFloat(value) : 0.00;
        }
    },
    minimum_balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Minimum balance must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Minimum balance cannot be negative'
            }
        },
        get() {
            const value = this.getDataValue('minimum_balance');
            return value ? parseFloat(value) : 0.00;
        }
    },
    last_statement_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_interest_calculation: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Account',
    tableName: 'accounts',
    timestamps: true,
    paranoid: true, // Enables soft deletes
    hooks: {
        beforeCreate: async (account) => {
            if (!account.account_number) {
                // Generate account number if not provided
                let accountNumber;
                let exists = true;

                while (exists) {
                    accountNumber = generateAccountNumber();
                    const existingAccount = await Account.findOne({
                        where: { account_number: accountNumber },
                        paranoid: false
                    });
                    exists = !!existingAccount;
                }

                account.account_number = accountNumber;
            }
        },
        beforeUpdate: (account) => {
            // Prevent certain updates on closed accounts
            if (!account.is_active) {
                if (account.changed('balance') && account.balance !== 0) {
                    throw new Error('Cannot modify balance of inactive account unless setting to zero');
                }
            }
        }
    },
    indexes: [
        {
            unique: true,
            fields: ['account_number']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['account_type']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['currency']
        },
        {
            fields: ['created_at']
        }
    ],
    validate: {
        creditAccountValidation() {
            if (this.account_type === ACCOUNT_TYPES.CREDIT && this.balance > 0) {
                throw new Error('Credit account balance cannot be positive');
            }
        },
        overdraftValidation() {
            if (this.account_type === ACCOUNT_TYPES.CREDIT && this.overdraft_limit > 0) {
                throw new Error('Credit accounts cannot have overdraft limits');
            }
        }
    }
});

module.exports = Account;
