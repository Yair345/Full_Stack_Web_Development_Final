const { Branch, BranchStatistics, BranchReport, User, Account, Loan, Transaction } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class BranchService {
    /**
     * Create daily statistics for a branch
     * @param {Number} branchId - Branch ID
     * @param {Date} date - Date for statistics
     * @returns {Object} Statistics object
     */
    static async generateDailyStatistics(branchId, date = new Date()) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const branch = await Branch.findByPk(branchId);
        if (!branch) {
            throw new Error('Branch not found');
        }

        // Get customers count
        const totalCustomers = await User.count({
            where: { branch_id: branchId, role: 'customer' }
        });

        const newCustomersToday = await User.count({
            where: {
                branch_id: branchId,
                role: 'customer',
                created_at: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        // Get active accounts count
        const activeAccounts = await Account.count({
            include: [{
                model: User,
                as: 'user',
                where: { branch_id: branchId }
            }],
            where: { is_active: true }
        });

        // Get transactions for the day
        const transactions = await Transaction.findAll({
            include: [{
                model: Account,
                as: 'fromAccount',
                include: [{
                    model: User,
                    as: 'user',
                    where: { branch_id: branchId }
                }]
            }],
            where: {
                status: 'completed',
                completed_at: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        // Calculate totals
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let revenue = 0;

        transactions.forEach(transaction => {
            const amount = parseFloat(transaction.amount);
            if (transaction.transaction_type === 'deposit') {
                totalDeposits += amount;
            } else if (transaction.transaction_type === 'withdrawal') {
                totalWithdrawals += amount;
            }
            // Assume small fee for each transaction as revenue
            revenue += 2.50;
        });

        // Get total loans amount for customers in this branch
        const totalLoans = await Loan.sum('amount', {
            include: [{
                model: User,
                as: 'borrower',
                where: { branch_id: branchId }
            }],
            where: { status: 'active' }
        }) || 0;

        // Get pending loan applications
        const pendingLoanApplications = await Loan.count({
            include: [{
                model: User,
                as: 'borrower',
                where: { branch_id: branchId }
            }],
            where: { status: 'pending' }
        });

        // Generate random customer satisfaction score (in real app, this would come from surveys)
        const customerSatisfactionScore = (Math.random() * 2 + 3).toFixed(2); // 3.0 to 5.0

        const statisticsData = {
            branch_id: branchId,
            date: date.toISOString().split('T')[0],
            total_customers: totalCustomers,
            new_customers_today: newCustomersToday,
            active_accounts: activeAccounts,
            total_deposits: totalDeposits,
            total_withdrawals: totalWithdrawals,
            total_loans: totalLoans,
            pending_loan_applications: pendingLoanApplications,
            transactions_count: transactions.length,
            revenue,
            customer_satisfaction_score: parseFloat(customerSatisfactionScore)
        };

        // Upsert statistics (update if exists, insert if not)
        const [statistics] = await BranchStatistics.upsert(statisticsData, {
            where: { branch_id: branchId, date: statisticsData.date }
        });

        return statistics;
    }

    /**
     * Get branch performance overview
     * @param {Number} branchId - Branch ID
     * @param {Number} days - Number of days to look back
     * @returns {Object} Performance overview
     */
    static async getBranchPerformance(branchId, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const statistics = await BranchStatistics.findAll({
            where: {
                branch_id: branchId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['date', 'ASC']]
        });

        if (statistics.length === 0) {
            return null;
        }

        // Calculate totals and averages
        const totals = statistics.reduce((acc, stat) => ({
            newCustomers: acc.newCustomers + stat.new_customers_today,
            totalTransactions: acc.totalTransactions + stat.transactions_count,
            totalRevenue: acc.totalRevenue + stat.revenue,
            netCashFlow: acc.netCashFlow + (stat.total_deposits - stat.total_withdrawals)
        }), {
            newCustomers: 0,
            totalTransactions: 0,
            totalRevenue: 0,
            netCashFlow: 0
        });

        const latest = statistics[statistics.length - 1];
        const averages = {
            dailyNewCustomers: totals.newCustomers / statistics.length,
            dailyTransactions: totals.totalTransactions / statistics.length,
            dailyRevenue: totals.totalRevenue / statistics.length,
            averageSatisfaction: statistics.reduce((sum, s) =>
                sum + (s.customer_satisfaction_score || 0), 0) / statistics.length
        };

        // Calculate growth rates (compare first and last)
        const first = statistics[0];
        const growthRates = {
            customerGrowth: first.total_customers > 0 ?
                ((latest.total_customers - first.total_customers) / first.total_customers) * 100 : 0,
            accountGrowth: first.active_accounts > 0 ?
                ((latest.active_accounts - first.active_accounts) / first.active_accounts) * 100 : 0
        };

        return {
            period: {
                startDate,
                endDate,
                days: statistics.length
            },
            current: {
                totalCustomers: latest.total_customers,
                activeAccounts: latest.active_accounts,
                pendingLoans: latest.pending_loan_applications,
                satisfactionScore: latest.customer_satisfaction_score
            },
            totals,
            averages,
            growthRates,
            trends: statistics.map(s => ({
                date: s.date,
                customers: s.total_customers,
                transactions: s.transactions_count,
                revenue: s.revenue,
                satisfaction: s.customer_satisfaction_score
            }))
        };
    }

    /**
     * Generate statistics for all branches for a specific date
     * @param {Date} date - Date to generate statistics for
     */
    static async generateAllBranchStatistics(date = new Date()) {
        const branches = await Branch.findAll({
            where: { is_active: true }
        });

        const results = [];
        for (const branch of branches) {
            try {
                const statistics = await this.generateDailyStatistics(branch.id, date);
                results.push(statistics);
            } catch (error) {
                console.error(`Error generating statistics for branch ${branch.id}:`, error.message);
            }
        }

        return results;
    }

    /**
     * Get branch rankings based on various metrics
     * @param {String} metric - Metric to rank by (revenue, customers, satisfaction, etc.)
     * @param {Number} days - Number of days to consider
     * @returns {Array} Ranked branches
     */
    static async getBranchRankings(metric = 'revenue', days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const rankings = await sequelize.query(`
            SELECT 
                b.id,
                b.branch_name,
                b.branch_code,
                b.city,
                b.state,
                AVG(bs.total_customers) as avg_customers,
                SUM(bs.revenue) as total_revenue,
                AVG(bs.customer_satisfaction_score) as avg_satisfaction,
                SUM(bs.transactions_count) as total_transactions
            FROM branches b
            LEFT JOIN branch_statistics bs ON b.id = bs.branch_id
            WHERE b.is_active = true 
                AND bs.date BETWEEN :startDate AND :endDate
            GROUP BY b.id, b.branch_name, b.branch_code, b.city, b.state
            ORDER BY ${metric === 'revenue' ? 'total_revenue' :
                metric === 'customers' ? 'avg_customers' :
                    metric === 'satisfaction' ? 'avg_satisfaction' : 'total_transactions'} DESC
        `, {
            replacements: { startDate, endDate },
            type: sequelize.QueryTypes.SELECT
        });

        return rankings.map((branch, index) => ({
            rank: index + 1,
            ...branch,
            performance_score: this.calculatePerformanceScore(branch)
        }));
    }

    /**
     * Calculate overall performance score for a branch
     * @param {Object} branchStats - Branch statistics
     * @returns {Number} Performance score (0-100)
     */
    static calculatePerformanceScore(branchStats) {
        const {
            total_revenue = 0,
            avg_customers = 0,
            avg_satisfaction = 0,
            total_transactions = 0
        } = branchStats;

        // Normalize metrics (weights can be adjusted)
        const revenueScore = Math.min((total_revenue / 50000) * 25, 25); // Max 25 points
        const customerScore = Math.min((avg_customers / 500) * 25, 25);   // Max 25 points
        const satisfactionScore = (avg_satisfaction / 5) * 25;            // Max 25 points
        const transactionScore = Math.min((total_transactions / 1000) * 25, 25); // Max 25 points

        return Math.round(revenueScore + customerScore + satisfactionScore + transactionScore);
    }

    /**
     * Get branch comparison data
     * @param {Array} branchIds - Array of branch IDs to compare
     * @param {Number} days - Number of days to consider
     * @returns {Object} Comparison data
     */
    static async compareBranches(branchIds, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const comparisons = [];

        for (const branchId of branchIds) {
            const performance = await this.getBranchPerformance(branchId, days);
            const branch = await Branch.findByPk(branchId, {
                attributes: ['id', 'branch_name', 'branch_code', 'city', 'state']
            });

            if (branch && performance) {
                comparisons.push({
                    branch,
                    performance
                });
            }
        }

        return {
            period: { startDate, endDate, days },
            branches: comparisons,
            summary: this.generateComparisonSummary(comparisons)
        };
    }

    /**
     * Generate summary for branch comparison
     * @param {Array} comparisons - Branch comparison data
     * @returns {Object} Summary data
     */
    static generateComparisonSummary(comparisons) {
        if (comparisons.length === 0) return {};

        const metrics = comparisons.map(c => c.performance);

        return {
            topPerformer: {
                revenue: comparisons.find(c =>
                    c.performance.totals.totalRevenue === Math.max(...metrics.map(m => m.totals.totalRevenue))),
                satisfaction: comparisons.find(c =>
                    c.performance.averages.averageSatisfaction === Math.max(...metrics.map(m => m.averages.averageSatisfaction))),
                growth: comparisons.find(c =>
                    c.performance.growthRates.customerGrowth === Math.max(...metrics.map(m => m.growthRates.customerGrowth)))
            },
            averages: {
                revenue: metrics.reduce((sum, m) => sum + m.totals.totalRevenue, 0) / metrics.length,
                customers: metrics.reduce((sum, m) => sum + m.current.totalCustomers, 0) / metrics.length,
                satisfaction: metrics.reduce((sum, m) => sum + m.averages.averageSatisfaction, 0) / metrics.length
            }
        };
    }

    /**
     * Get branch alerts based on performance thresholds
     * @param {Number} branchId - Branch ID (optional, if not provided checks all branches)
     * @returns {Array} Array of alerts
     */
    static async getBranchAlerts(branchId = null) {
        const whereClause = { is_active: true };
        if (branchId) whereClause.id = branchId;

        const branches = await Branch.findAll({ where: whereClause });
        const alerts = [];

        for (const branch of branches) {
            const performance = await this.getBranchPerformance(branch.id, 7); // Last 7 days

            if (!performance) continue;

            const branchAlerts = [];

            // Check satisfaction score
            if (performance.averages.averageSatisfaction < 3.0) {
                branchAlerts.push({
                    type: 'low_satisfaction',
                    severity: 'high',
                    message: `Customer satisfaction is below 3.0 (${performance.averages.averageSatisfaction.toFixed(2)})`
                });
            }

            // Check negative growth
            if (performance.growthRates.customerGrowth < -10) {
                branchAlerts.push({
                    type: 'customer_decline',
                    severity: 'medium',
                    message: `Customer count declined by ${Math.abs(performance.growthRates.customerGrowth).toFixed(1)}%`
                });
            }

            // Check low daily revenue
            if (performance.averages.dailyRevenue < 1000) {
                branchAlerts.push({
                    type: 'low_revenue',
                    severity: 'medium',
                    message: `Daily revenue below target ($${performance.averages.dailyRevenue.toFixed(2)})`
                });
            }

            // Check high pending loans
            if (performance.current.pendingLoans > 20) {
                branchAlerts.push({
                    type: 'high_pending_loans',
                    severity: 'low',
                    message: `High number of pending loan applications (${performance.current.pendingLoans})`
                });
            }

            if (branchAlerts.length > 0) {
                alerts.push({
                    branch: {
                        id: branch.id,
                        name: branch.branch_name,
                        code: branch.branch_code
                    },
                    alerts: branchAlerts
                });
            }
        }

        return alerts;
    }
}

module.exports = BranchService;
