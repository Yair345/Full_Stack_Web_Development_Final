const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class BranchReport extends Model {
    /**
     * Check if report generation is completed
     * @returns {Boolean} Is completed
     */
    isCompleted() {
        return this.status === 'completed';
    }

    /**
     * Check if report generation failed
     * @returns {Boolean} Has failed
     */
    hasFailed() {
        return this.status === 'failed';
    }

    /**
     * Check if report is currently being generated
     * @returns {Boolean} Is generating
     */
    isGenerating() {
        return this.status === 'generating';
    }

    /**
     * Get report file information
     * @returns {Object} File information
     */
    getFileInfo() {
        return {
            fileName: this.file_path ? this.file_path.split('/').pop() : null,
            filePath: this.file_path,
            fileSize: this.file_size,
            downloadUrl: this.file_path ? `/api/branches/reports/${this.id}/download` : null
        };
    }

    /**
     * Get formatted file size
     * @returns {String} Formatted file size
     */
    getFormattedFileSize() {
        if (!this.file_size) return 'Unknown';

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        let size = this.file_size;
        let i = 0;

        while (size >= 1024 && i < sizes.length - 1) {
            size /= 1024;
            i++;
        }

        return `${Math.round(size * 100) / 100} ${sizes[i]}`;
    }

    /**
     * Get report duration in days
     * @returns {Number} Duration in days
     */
    getReportDuration() {
        const startDate = new Date(this.start_date);
        const endDate = new Date(this.end_date);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    /**
     * Get report type display name
     * @returns {String} Display name
     */
    getTypeDisplayName() {
        const types = {
            'daily': 'Daily Report',
            'weekly': 'Weekly Report',
            'monthly': 'Monthly Report',
            'quarterly': 'Quarterly Report',
            'annual': 'Annual Report',
            'custom': 'Custom Report'
        };
        return types[this.report_type] || this.report_type;
    }

    /**
     * Get time elapsed since generation
     * @returns {String} Time elapsed
     */
    getTimeElapsed() {
        const now = new Date();
        const created = new Date(this.created_at);
        const diffMs = now - created;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return `${Math.max(1, diffMins)} minute${diffMins > 1 ? 's' : ''} ago`;
        }
    }

    /**
     * Convert to safe JSON for API response
     * @returns {Object} Safe report object
     */
    toSafeJSON() {
        const report = this.toJSON();
        return {
            ...report,
            fileInfo: this.getFileInfo(),
            formattedFileSize: this.getFormattedFileSize(),
            typeDisplayName: this.getTypeDisplayName(),
            reportDuration: this.getReportDuration(),
            timeElapsed: this.getTimeElapsed()
        };
    }
}

BranchReport.init({
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
    report_type: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom']],
                msg: 'Invalid report type'
            }
        }
    },
    report_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Report name cannot be empty'
            },
            len: {
                args: [5, 200],
                msg: 'Report name must be between 5 and 200 characters'
            }
        }
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'Start date must be a valid date'
            }
        }
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'End date must be a valid date'
            },
            isAfterStartDate(value) {
                if (value < this.start_date) {
                    throw new Error('End date must be after start date');
                }
            }
        }
    },
    generated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Generated by user ID is required'
            },
            isInt: {
                msg: 'Generated by must be an integer'
            }
        }
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
            len: {
                args: [0, 500],
                msg: 'File path cannot exceed 500 characters'
            }
        }
    },
    file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: {
                args: [0],
                msg: 'File size cannot be negative'
            }
        }
    },
    status: {
        type: DataTypes.ENUM('generating', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'generating',
        validate: {
            isIn: {
                args: [['generating', 'completed', 'failed']],
                msg: 'Invalid status'
            }
        }
    },
    parameters: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    summary: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'BranchReport',
    tableName: 'branch_reports',
    timestamps: true,
    paranoid: true, // Enable soft deletes
    hooks: {
        beforeCreate: async (report) => {
            // Auto-generate report name if not provided
            if (!report.report_name || report.report_name.trim() === '') {
                const startDate = new Date(report.start_date).toLocaleDateString();
                const endDate = new Date(report.end_date).toLocaleDateString();
                report.report_name = `${report.getTypeDisplayName()} - ${startDate} to ${endDate}`;
            }
        },
        beforeUpdate: (report) => {
            // Update file info when status changes to completed
            if (report.changed('status') && report.status === 'completed' && !report.file_path) {
                // This would be handled in the service layer
            }
        }
    },
    indexes: [
        {
            fields: ['branch_id', 'report_type']
        },
        {
            fields: ['status']
        },
        {
            fields: ['generated_by']
        },
        {
            fields: ['start_date', 'end_date']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['report_type']
        }
    ]
});

module.exports = BranchReport;
