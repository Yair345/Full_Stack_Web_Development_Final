const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Branch extends Model {
    /**
     * Check if branch is active
     * @returns {Boolean} Is active
     */
    isActive() {
        return this.is_active;
    }

    /**
     * Get formatted branch address
     * @returns {String} Full address
     */
    getFullAddress() {
        return `${this.address}, ${this.city}, ${this.state} ${this.postal_code}, ${this.country}`;
    }

    /**
     * Get branch services as array
     * @returns {Array} Services offered
     */
    getServices() {
        return this.services_offered || [];
    }

    /**
     * Get opening hours for a specific day
     * @param {String} day - Day of the week
     * @returns {String} Opening hours
     */
    getOpeningHours(day) {
        const hours = this.opening_hours || {};
        return hours[day.toLowerCase()] || 'closed';
    }

    /**
     * Check if branch offers specific service
     * @param {String} service - Service name
     * @returns {Boolean} Offers service
     */
    offersService(service) {
        const services = this.getServices();
        return services.includes(service);
    }

    /**
     * Get masked phone number for display
     * @returns {String} Masked phone number
     */
    getMaskedPhone() {
        if (!this.phone) return '';
        return this.phone.replace(/(\d{3})-(\d{3})-(\d{4})/, '$1-***-$3');
    }

    /**
     * Convert to JSON (safe for public display)
     * @returns {Object} Safe branch object
     */
    toSafeJSON() {
        const branch = this.toJSON();
        return {
            ...branch,
            phone: this.getMaskedPhone()
        };
    }
}

Branch.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    branch_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: {
            name: 'branch_code',
            msg: 'Branch code already exists'
        },
        validate: {
            notEmpty: {
                msg: 'Branch code cannot be empty'
            },
            len: {
                args: [3, 10],
                msg: 'Branch code must be between 3 and 10 characters'
            },
            is: {
                args: /^[A-Z0-9]+$/,
                msg: 'Branch code can only contain uppercase letters and numbers'
            }
        }
    },
    branch_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Branch name cannot be empty'
            },
            len: {
                args: [2, 100],
                msg: 'Branch name must be between 2 and 100 characters'
            }
        }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Address cannot be empty'
            },
            len: {
                args: [5, 500],
                msg: 'Address must be between 5 and 500 characters'
            }
        }
    },
    city: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'City cannot be empty'
            },
            len: {
                args: [2, 50],
                msg: 'City must be between 2 and 50 characters'
            }
        }
    },
    state: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'State/Region cannot be empty'
            },
            len: {
                args: [2, 50],
                msg: 'State/Region must be between 2 and 50 characters'
            }
        }
    },
    postal_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Postal code cannot be empty'
            },
            len: {
                args: [3, 20],
                msg: 'Postal code must be between 3 and 20 characters'
            }
        }
    },
    country: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Israel',
        validate: {
            notEmpty: {
                msg: 'Country cannot be empty'
            },
            len: {
                args: [2, 50],
                msg: 'Country must be between 2 and 50 characters'
            }
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Phone number cannot be empty'
            },
            is: {
                args: /^\+?[\d\s\-\(\)]+$/,
                msg: 'Phone number format is invalid'
            }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: {
                msg: 'Must be a valid email address'
            },
            notEmpty: {
                msg: 'Email cannot be empty'
            }
        }
    },
    manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            isInt: {
                msg: 'Manager ID must be an integer'
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
    opening_hours: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            monday: "08:30-17:00",
            tuesday: "08:30-17:00",
            wednesday: "08:30-17:00",
            thursday: "08:30-17:00",
            friday: "08:30-13:00",
            saturday: "closed",
            sunday: "09:00-15:00"
        }
    },
    services_offered: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [
            "personal_banking",
            "business_banking",
            "loans",
            "mortgages",
            "investments"
        ]
    }
}, {
    sequelize,
    modelName: 'Branch',
    tableName: 'branches',
    timestamps: true,
    paranoid: true, // Enables soft deletes
    hooks: {
        beforeCreate: async (branch) => {
            // Auto-generate branch code if not provided
            if (!branch.branch_code) {
                const cityCode = branch.city.substring(0, 3).toUpperCase();
                const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                branch.branch_code = `${cityCode}${randomNum}`;
            }
        },
        beforeUpdate: (branch) => {
            // Prevent deactivating branch with active customers
            if (branch.changed('is_active') && !branch.is_active) {
                // This validation would need to check for active customers
                // Implementation would be in the controller
            }
        }
    },
    indexes: [
        {
            unique: true,
            fields: ['branch_code']
        },
        {
            fields: ['branch_name']
        },
        {
            fields: ['city']
        },
        {
            fields: ['state']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['manager_id']
        },
        {
            fields: ['created_at']
        }
    ]
});

module.exports = Branch;
