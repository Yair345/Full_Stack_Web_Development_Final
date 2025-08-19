const { Branch, User, Account, Loan } = require('../models');
const { Op } = require('sequelize');

class BranchService {
    /**
     * Get basic branch information with counts
     * @param {Number} branchId - Branch ID
     * @returns {Object} Branch info with basic counts
     */
    static async getBranchInfo(branchId) {
        const branch = await Branch.findByPk(branchId);
        if (!branch) {
            throw new Error('Branch not found');
        }

        // Get basic counts
        const totalCustomers = await User.count({
            where: { branch_id: branchId, role: 'customer' }
        });

        const activeAccounts = await Account.count({
            include: [{
                model: User,
                as: 'user',
                where: { branch_id: branchId }
            }],
            where: { is_active: true }
        });

        const pendingLoans = await Loan.count({
            where: {
                branch_id: branchId,
                status: 'pending_approval'
            }
        });

        return {
            branch,
            counts: {
                totalCustomers,
                activeAccounts,
                pendingLoans
            }
        };
    }

    /**
     * Placeholder method for backward compatibility with scripts
     * @param {Number} branchId - Branch ID
     * @param {Date} date - Date for statistics
     * @returns {Object} Empty object (statistics removed)
     */
    static async generateDailyStatistics(branchId, date = new Date()) {
        console.log(`Statistics generation disabled for branch ${branchId} on ${date}`);
        return {};
    }
}

module.exports = BranchService;