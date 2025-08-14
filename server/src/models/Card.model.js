const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { generateCardNumber, generateCVV } = require('../utils/encryption.utils');
const { CARD_TYPES, CARD_STATUS } = require('../utils/constants');

class Card extends Model {
    /**
     * Check if card is active
     * @returns {Boolean} Is active
     */
    isActive() {
        return this.status === CARD_STATUS.ACTIVE;
    }

    /**
     * Check if card is blocked
     * @returns {Boolean} Is blocked
     */
    isBlocked() {
        return this.status === CARD_STATUS.BLOCKED;
    }

    /**
     * Check if card is expired
     * @returns {Boolean} Is expired
     */
    isExpired() {
        const now = new Date();
        const expiry = new Date(this.expiry_date);
        return expiry < now || this.status === CARD_STATUS.EXPIRED;
    }

    /**
     * Check if card is cancelled
     * @returns {Boolean} Is cancelled
     */
    isCancelled() {
        return this.status === CARD_STATUS.CANCELLED;
    }

    /**
     * Check if card is debit card
     * @returns {Boolean} Is debit card
     */
    isDebitCard() {
        return this.card_type === CARD_TYPES.DEBIT;
    }

    /**
     * Check if card is credit card
     * @returns {Boolean} Is credit card
     */
    isCreditCard() {
        return this.card_type === CARD_TYPES.CREDIT;
    }

    /**
     * Get masked card number for display
     * @returns {String} Masked card number
     */
    getMaskedCardNumber() {
        const cardNumber = this.card_number;
        return `**** **** **** ${cardNumber.slice(-4)}`;
    }

    /**
     * Check if PIN is set
     * @returns {Boolean} Has PIN
     */
    hasPIN() {
        return !!this.pin_hash;
    }

    /**
     * Check if card can be used
     * @returns {Boolean} Can be used
     */
    canBeUsed() {
        return this.isActive() && !this.isExpired();
    }

    /**
     * Get days until expiry
     * @returns {Number} Days until expiry
     */
    getDaysUntilExpiry() {
        const now = new Date();
        const expiry = new Date(this.expiry_date);
        const diffTime = expiry - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Convert to JSON (mask sensitive data)
     * @returns {Object} Safe card object
     */
    toSafeJSON() {
        const card = this.toJSON();
        return {
            ...card,
            card_number: this.getMaskedCardNumber(),
            cvv: '***',
            pin_hash: undefined
        };
    }
}

Card.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        },
        validate: {
            notEmpty: {
                msg: 'Account ID is required'
            }
        }
    },
    card_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: {
            name: 'card_number',
            msg: 'Card number already exists'
        },
        validate: {
            notEmpty: {
                msg: 'Card number cannot be empty'
            },
            len: {
                args: [13, 20],
                msg: 'Card number must be between 13 and 20 digits'
            },
            isNumeric: {
                msg: 'Card number must contain only digits'
            }
        }
    },
    card_type: {
        type: DataTypes.ENUM(CARD_TYPES.DEBIT, CARD_TYPES.CREDIT),
        allowNull: false,
        validate: {
            isIn: {
                args: [[CARD_TYPES.DEBIT, CARD_TYPES.CREDIT]],
                msg: 'Card type must be debit or credit'
            }
        }
    },
    card_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Card name cannot be empty'
            },
            len: {
                args: [2, 100],
                msg: 'Card name must be between 2 and 100 characters'
            },
            is: {
                args: /^[a-zA-Z\s.'-]+$/,
                msg: 'Card name can only contain letters, spaces, periods, apostrophes, and hyphens'
            }
        }
    },
    cvv: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'CVV cannot be empty'
            },
            len: {
                args: [3, 4],
                msg: 'CVV must be 3 or 4 digits'
            },
            isNumeric: {
                msg: 'CVV must contain only digits'
            }
        }
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'Expiry date must be a valid date'
            },
            isAfter: {
                args: new Date().toISOString().split('T')[0],
                msg: 'Expiry date must be in the future'
            }
        }
    },
    status: {
        type: DataTypes.ENUM(
            CARD_STATUS.ACTIVE,
            CARD_STATUS.BLOCKED,
            CARD_STATUS.EXPIRED,
            CARD_STATUS.CANCELLED
        ),
        allowNull: false,
        defaultValue: CARD_STATUS.ACTIVE,
        validate: {
            isIn: {
                args: [Object.values(CARD_STATUS)],
                msg: 'Invalid card status'
            }
        }
    },
    pin_hash: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    daily_limit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1000.00,
        validate: {
            isDecimal: {
                msg: 'Daily limit must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Daily limit cannot be negative'
            },
            max: {
                args: [50000.00],
                msg: 'Daily limit cannot exceed $50,000'
            }
        },
        get() {
            const value = this.getDataValue('daily_limit');
            return value ? parseFloat(value) : 0.00;
        }
    },
    monthly_limit: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 30000.00,
        validate: {
            isDecimal: {
                msg: 'Monthly limit must be a valid decimal number'
            },
            min: {
                args: [0],
                msg: 'Monthly limit cannot be negative'
            },
            max: {
                args: [1000000.00],
                msg: 'Monthly limit cannot exceed $1,000,000'
            }
        },
        get() {
            const value = this.getDataValue('monthly_limit');
            return value ? parseFloat(value) : 0.00;
        }
    },
    contactless_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    online_transactions_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    international_transactions_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    last_used: {
        type: DataTypes.DATE,
        allowNull: true
    },
    failed_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Failed attempts cannot be negative'
            }
        }
    },
    blocked_until: {
        type: DataTypes.DATE,
        allowNull: true
    },
    issued_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    replacement_for: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'cards',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Card',
    tableName: 'cards',
    timestamps: true,
    paranoid: true, // Enables soft deletes
    hooks: {
        beforeCreate: async (card) => {
            if (!card.card_number) {
                // Generate card number if not provided
                let cardNumber;
                let exists = true;

                while (exists) {
                    cardNumber = generateCardNumber();
                    const existingCard = await Card.findOne({
                        where: { card_number: cardNumber },
                        paranoid: false
                    });
                    exists = !!existingCard;
                }

                card.card_number = cardNumber;
            }

            if (!card.cvv) {
                card.cvv = generateCVV();
            }

            if (!card.expiry_date) {
                // Set expiry date to 4 years from now
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 4);
                card.expiry_date = expiryDate;
            }
        },
        beforeUpdate: (card) => {
            // Auto-expire card if expiry date has passed
            if (card.expiry_date && new Date(card.expiry_date) < new Date()) {
                card.status = CARD_STATUS.EXPIRED;
            }

            // Block card if too many failed attempts
            if (card.failed_attempts >= 3 && card.status === CARD_STATUS.ACTIVE) {
                card.status = CARD_STATUS.BLOCKED;
                card.blocked_until = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            }
        }
    },
    indexes: [
        {
            unique: true,
            fields: ['card_number']
        },
        {
            fields: ['account_id']
        },
        {
            fields: ['card_type']
        },
        {
            fields: ['status']
        },
        {
            fields: ['expiry_date']
        },
        {
            fields: ['last_used']
        },
        {
            fields: ['replacement_for']
        }
    ],
    validate: {
        limitValidation() {
            if (this.monthly_limit < this.daily_limit) {
                throw new Error('Monthly limit cannot be less than daily limit');
            }
        },
        expiryValidation() {
            if (this.expiry_date && new Date(this.expiry_date) <= new Date()) {
                if (this.status !== CARD_STATUS.EXPIRED) {
                    throw new Error('Expired cards must have status "expired"');
                }
            }
        }
    }
});

module.exports = Card;
