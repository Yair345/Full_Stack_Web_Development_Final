const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { hashPassword } = require('../utils/encryption.utils');
const { USER_ROLES } = require('../utils/constants');

class User extends Model {
    /**
     * Check if user has specific role
     * @param {String} role - Role to check
     * @returns {Boolean} Has role
     */
    hasRole(role) {
        return this.role === role;
    }

    /**
     * Check if user is admin
     * @returns {Boolean} Is admin
     */
    isAdmin() {
        return this.role === USER_ROLES.ADMIN;
    }

    /**
     * Check if user is manager
     * @returns {Boolean} Is manager
     */
    isManager() {
        return this.role === USER_ROLES.MANAGER;
    }

    /**
     * Check if user is customer
     * @returns {Boolean} Is customer
     */
    isCustomer() {
        return this.role === USER_ROLES.CUSTOMER;
    }

    /**
     * Get user's full name
     * @returns {String} Full name
     */
    getFullName() {
        return `${this.first_name} ${this.last_name}`;
    }

    /**
     * Convert to JSON (exclude sensitive fields)
     * @returns {Object} Safe user object
     */
    toSafeJSON() {
        const { password, reset_token, reset_token_expires, ...safeUser } = this.toJSON();
        return safeUser;
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
            name: 'username',
            msg: 'Username already exists'
        },
        validate: {
            notEmpty: {
                msg: 'Username cannot be empty'
            },
            len: {
                args: [3, 50],
                msg: 'Username must be between 3 and 50 characters'
            },
            is: {
                args: /^[a-zA-Z0-9_]+$/,
                msg: 'Username can only contain letters, numbers, and underscores'
            }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            name: 'email',
            msg: 'Email already exists'
        },
        validate: {
            isEmail: {
                msg: 'Must be a valid email address'
            },
            notEmpty: {
                msg: 'Email cannot be empty'
            }
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Password cannot be empty'
            },
            len: {
                args: [8, 255],
                msg: 'Password must be at least 8 characters long'
            }
        }
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'First name cannot be empty'
            },
            len: {
                args: [1, 50],
                msg: 'First name must be between 1 and 50 characters'
            },
            is: {
                args: /^[a-zA-Z\s]+$/,
                msg: 'First name can only contain letters and spaces'
            }
        }
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Last name cannot be empty'
            },
            len: {
                args: [1, 50],
                msg: 'Last name must be between 1 and 50 characters'
            },
            is: {
                args: /^[a-zA-Z\s]+$/,
                msg: 'Last name can only contain letters and spaces'
            }
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            is: {
                args: /^\+?[\d\s\-\(\)]+$/,
                msg: 'Phone number format is invalid'
            }
        }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'Date of birth must be a valid date'
            },
            isBefore: {
                args: new Date().toISOString().split('T')[0],
                msg: 'Date of birth must be in the past'
            },
            isAdult(value) {
                const today = new Date();
                const birthDate = new Date(value);
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < 18) {
                    throw new Error('Must be at least 18 years old');
                }
            }
        }
    },
    national_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: {
            name: 'national_id',
            msg: 'National ID already exists'
        },
        validate: {
            notEmpty: {
                msg: 'National ID cannot be empty'
            },
            len: {
                args: [5, 20],
                msg: 'National ID must be between 5 and 20 characters'
            },
            is: {
                args: /^[a-zA-Z0-9]+$/,
                msg: 'National ID can only contain letters and numbers'
            }
        }
    },
    role: {
        type: DataTypes.ENUM(USER_ROLES.CUSTOMER, USER_ROLES.MANAGER, USER_ROLES.ADMIN),
        allowNull: false,
        defaultValue: USER_ROLES.CUSTOMER,
        validate: {
            isIn: {
                args: [[USER_ROLES.CUSTOMER, USER_ROLES.MANAGER, USER_ROLES.ADMIN]],
                msg: 'Role must be customer, manager, or admin'
            }
        }
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'branches',
            key: 'id'
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    email_verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    email_verification_expires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    reset_token_expires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    login_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    locked_until: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Enables soft deletes
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await hashPassword(user.password);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await hashPassword(user.password);
            }
        }
    },
    indexes: [
        {
            unique: true,
            fields: ['username']
        },
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['national_id']
        },
        {
            fields: ['role']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['branch_id']
        }
    ]
});

module.exports = User;
