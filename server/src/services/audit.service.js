const { AuditLog, SystemLog } = require('../config/mongodb');
const { getClientIP } = require('../utils/helpers');

/**
 * Audit Service for MongoDB logging
 * This service handles all audit logging to MongoDB
 */
class AuditService {
    /**
     * Log user authentication events
     * @param {Object} params - Audit parameters
     * @param {string} params.action - Action performed (login, logout, register, etc.)
     * @param {Object} params.req - Express request object
     * @param {Object} params.user - User object (optional)
     * @param {boolean} params.success - Whether the action was successful
     * @param {Object} params.details - Additional details
     */
    static async logAuth({ action, req, user = null, success = true, details = {} }) {
        try {
            console.log(`🔄 Attempting to log auth audit: ${action} for user ${user?.username || 'anonymous'}`);

            // Check if MongoDB is connected
            const mongoose = require('mongoose');
            if (mongoose.connection.readyState !== 1) {
                console.warn('⚠️ MongoDB not connected, skipping audit log');
                return null;
            }

            const auditLog = new AuditLog({
                userId: user?.id || 'anonymous',
                action: `auth_${action}`,
                resource: 'authentication',
                resourceId: user?.id,
                details: {
                    success,
                    username: user?.username,
                    email: user?.email,
                    ...details
                },
                ipAddress: getClientIP(req),
                userAgent: req.get ? req.get('User-Agent') : req.headers?.['user-agent'] || 'Unknown',
                level: success ? 'info' : 'warning'
            });

            // Set a timeout for the save operation
            const savedLog = await Promise.race([
                auditLog.save(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Audit log save timeout')), 5000)
                )
            ]);

            console.log(`✅ Auth audit logged successfully: ${action} for user ${user?.username || 'anonymous'} (ID: ${savedLog._id})`);
            return savedLog;
        } catch (error) {
            console.error('❌ Failed to log auth audit:', error.message);
            console.error('Stack trace:', error.stack);
            // Don't throw error to avoid breaking the main flow
            return null;
        }
    }

    /**
     * Log transaction events
     * @param {Object} params - Audit parameters
     */
    static async logTransaction({ action, req, transaction, details = {} }) {
        try {
            const auditLog = new AuditLog({
                userId: req.user?.id || 'system',
                action: `transaction_${action}`,
                resource: 'transaction',
                resourceId: transaction?.id || transaction?.transaction_ref,
                details: {
                    transactionRef: transaction?.transaction_ref,
                    amount: transaction?.amount,
                    currency: transaction?.currency,
                    fromAccountId: transaction?.from_account_id,
                    toAccountId: transaction?.to_account_id,
                    type: transaction?.type,
                    status: transaction?.status,
                    ...details
                },
                ipAddress: getClientIP(req),
                userAgent: req.get('User-Agent'),
                level: 'info'
            });

            await auditLog.save();
            console.log(`✅ Transaction audit logged: ${action} - ${transaction?.transaction_ref}`);
            return auditLog;
        } catch (error) {
            console.error('❌ Failed to log transaction audit:', error.message);
        }
    }

    /**
     * Log account management events
     * @param {Object} params - Audit parameters
     */
    static async logAccount({ action, req, account, details = {} }) {
        try {
            const auditLog = new AuditLog({
                userId: req.user?.id || 'system',
                action: `account_${action}`,
                resource: 'account',
                resourceId: account?.id,
                details: {
                    accountNumber: account?.account_number,
                    accountType: account?.type,
                    balance: account?.balance,
                    currency: account?.currency,
                    ...details
                },
                ipAddress: getClientIP(req),
                userAgent: req.get('User-Agent'),
                level: 'info'
            });

            await auditLog.save();
            console.log(`✅ Account audit logged: ${action} - ${account?.account_number}`);
            return auditLog;
        } catch (error) {
            console.error('❌ Failed to log account audit:', error.message);
        }
    }

    /**
     * Log admin actions
     * @param {Object} params - Audit parameters
     */
    static async logAdmin({ action, req, target, details = {} }) {
        try {
            const auditLog = new AuditLog({
                userId: req.user?.id || 'system',
                action: `admin_${action}`,
                resource: 'admin_panel',
                resourceId: target?.id,
                details: {
                    adminUsername: req.user?.username,
                    targetType: target?.type,
                    targetId: target?.id,
                    targetUsername: target?.username,
                    ...details
                },
                ipAddress: getClientIP(req),
                userAgent: req.get('User-Agent'),
                level: 'warning' // Admin actions are typically high-priority
            });

            await auditLog.save();
            console.log(`✅ Admin audit logged: ${action} by ${req.user?.username}`);
            return auditLog;
        } catch (error) {
            console.error('❌ Failed to log admin audit:', error.message);
        }
    }

    /**
     * Log security events
     * @param {Object} params - Audit parameters
     */
    static async logSecurity({ event, req, details = {} }) {
        try {
            const auditLog = new AuditLog({
                userId: req.user?.id || 'anonymous',
                action: `security_${event}`,
                resource: 'security',
                details: {
                    event,
                    url: req.originalUrl,
                    method: req.method,
                    ...details
                },
                ipAddress: getClientIP(req),
                userAgent: req.get('User-Agent'),
                level: 'critical'
            });

            await auditLog.save();
            console.log(`🚨 Security audit logged: ${event}`);
            return auditLog;
        } catch (error) {
            console.error('❌ Failed to log security audit:', error.message);
        }
    }

    /**
     * Log system events
     * @param {Object} params - System log parameters
     */
    static async logSystem({ level, message, service, meta = {} }) {
        try {
            const systemLog = new SystemLog({
                level,
                message,
                service,
                meta
            });

            await systemLog.save();
            console.log(`📊 System log saved: ${level} - ${message}`);
            return systemLog;
        } catch (error) {
            console.error('❌ Failed to log system event:', error.message);
        }
    }

    /**
     * Get audit logs with filtering and pagination
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Query options (limit, skip, sort)
     */
    static async getAuditLogs(filters = {}, options = {}) {
        try {
            const {
                limit = 50,
                skip = 0,
                sort = { timestamp: -1 }
            } = options;

            const logs = await AuditLog.find(filters)
                .sort(sort)
                .limit(limit)
                .skip(skip)
                .lean();

            const total = await AuditLog.countDocuments(filters);

            return {
                logs,
                total,
                page: Math.floor(skip / limit) + 1,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('❌ Failed to fetch audit logs:', error.message);
            throw error;
        }
    }

    /**
     * Get system logs with filtering and pagination
     */
    static async getSystemLogs(filters = {}, options = {}) {
        try {
            const {
                limit = 50,
                skip = 0,
                sort = { timestamp: -1 }
            } = options;

            const logs = await SystemLog.find(filters)
                .sort(sort)
                .limit(limit)
                .skip(skip)
                .lean();

            const total = await SystemLog.countDocuments(filters);

            return {
                logs,
                total,
                page: Math.floor(skip / limit) + 1,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('❌ Failed to fetch system logs:', error.message);
            throw error;
        }
    }

    /**
     * Get recent activity for admin dashboard
     * @param {number} limit - Number of recent activities to retrieve
     */
    static async getRecentActivity(limit = 50) {
        try {
            // Check if MongoDB is connected
            const mongoose = require('mongoose');
            if (mongoose.connection.readyState !== 1) {
                console.warn('⚠️ MongoDB not connected, returning empty activity');
                return [];
            }

            // Get recent audit logs and system logs
            const [auditLogs, systemLogs] = await Promise.all([
                AuditLog.find({})
                    .sort({ timestamp: -1 })
                    .limit(Math.floor(limit / 2))
                    .lean(),
                SystemLog.find({})
                    .sort({ timestamp: -1 })
                    .limit(Math.floor(limit / 2))
                    .lean()
            ]);

            // Combine and format the activities
            const activities = [];

            // Process audit logs
            auditLogs.forEach(log => {
                activities.push({
                    id: log._id,
                    type: log.action,
                    description: this.formatAuditDescription(log),
                    timestamp: log.timestamp,
                    severity: log.level || 'info',
                    userId: log.userId,
                    ipAddress: log.ipAddress
                });
            });

            // Process system logs
            systemLogs.forEach(log => {
                activities.push({
                    id: log._id,
                    type: 'system_' + (log.service || 'general'),
                    description: log.message,
                    timestamp: log.timestamp,
                    severity: log.level || 'info',
                    service: log.service,
                    meta: log.meta
                });
            });

            // Sort by timestamp and return limited results
            return activities
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);

        } catch (error) {
            console.error('❌ Failed to get recent activity:', error.message);
            return [];
        }
    }

    /**
     * Format audit log description for display
     * @param {Object} log - Audit log object
     */
    static formatAuditDescription(log) {
        const { action, details } = log;

        switch (action) {
            case 'auth_login':
                return `User login: ${details.username || details.email}`;
            case 'auth_logout':
                return `User logout: ${details.username || details.email}`;
            case 'auth_register':
                return `New user registration: ${details.email}`;
            case 'transaction_created':
                return `Transaction created: $${details.amount} (${details.type})`;
            case 'loan_applied':
                return `Loan application: $${details.amount} (${details.loanType})`;
            case 'loan_approved':
                return `Loan approved: $${details.amount}`;
            case 'account_created':
                return `Account created: ${details.accountType}`;
            default:
                return log.details?.message || `Action: ${action}`;
        }
    }

    /**
     * Clean up old logs (for maintenance)
     * @param {number} daysToKeep - Number of days to keep logs
     */
    static async cleanupOldLogs(daysToKeep = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const auditResult = await AuditLog.deleteMany({
                timestamp: { $lt: cutoffDate }
            });

            const systemResult = await SystemLog.deleteMany({
                timestamp: { $lt: cutoffDate }
            });

            console.log(`🧹 Cleaned up ${auditResult.deletedCount} audit logs and ${systemResult.deletedCount} system logs`);

            return {
                auditLogsDeleted: auditResult.deletedCount,
                systemLogsDeleted: systemResult.deletedCount
            };
        } catch (error) {
            console.error('❌ Failed to cleanup old logs:', error.message);
            throw error;
        }
    }
}

module.exports = AuditService;
