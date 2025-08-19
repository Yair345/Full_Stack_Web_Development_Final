const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class BranchEmployee extends Model {
    /**
     * Check if employee is active
     * @returns {Boolean} Is active
     */
    isActive() {
        return this.is_active;
    }

    /**
     * Get employee position title
     * @returns {String} Position title
     */
    getPositionTitle() {
        const positions = {
            'manager': 'Branch Manager',
            'assistant_manager': 'Assistant Manager',
            'customer_representative': 'Customer Service Representative',
            'loan_officer': 'Loan Officer',
            'teller': 'Bank Teller',
            'security': 'Security Officer',
            'accountant': 'Branch Accountant'
        };
        return positions[this.position] || this.position;
    }

    /**
     * Calculate years of service
     * @returns {Number} Years of service
     */
    getYearsOfService() {
        const today = new Date();
        const hireDate = new Date(this.hire_date);
        const diffTime = Math.abs(today - hireDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.floor(diffDays / 365);
    }

    /**
     * Check if employee is manager
     * @returns {Boolean} Is manager
     */
    isManager() {
        return this.position === 'manager';
    }
}

BranchEmployee.init({
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
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'User ID is required'
            },
            isInt: {
                msg: 'User ID must be an integer'
            }
        }
    },
    position: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Position cannot be empty'
            },
            isIn: {
                args: [['manager', 'assistant_manager', 'customer_representative', 'loan_officer', 'teller', 'security', 'accountant']],
                msg: 'Invalid position'
            }
        }
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'Hire date must be a valid date'
            },
            isBefore: {
                args: new Date().toISOString().split('T')[0],
                msg: 'Hire date cannot be in the future'
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
    }
}, {
    sequelize,
    modelName: 'BranchEmployee',
    tableName: 'branch_employees',
    timestamps: true,
    paranoid: true, // Enables soft deletes
    indexes: [
        {
            unique: true,
            name: 'unique_user_branch',
            fields: ['user_id', 'branch_id']
        },
        {
            fields: ['branch_id', 'user_id']
        },
        {
            fields: ['position']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['hire_date']
        }
    ]
});

module.exports = BranchEmployee;
