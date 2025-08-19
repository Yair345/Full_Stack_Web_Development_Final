const { Branch, BranchStatistics, BranchReport, User, Account, Loan } = require('../models');
const { AppError } = require('../utils/error.utils');
const { catchAsync } = require('../middleware/error.middleware');
const { requestLogger: logger } = require('../middleware/logger.middleware');
const AuditService = require('../services/audit.service');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @desc Get all branches
 * @route GET /api/branches
 * @access Private (Manager/Admin)
 */
const getBranches = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, city, state, is_active } = req.query;
    const userId = req.user.id;

    logger.info(`Getting branches for user: ${userId}`);

    // Build where clause
    const whereClause = {};
    if (city) whereClause.city = { [Op.like]: `%${city}%` };
    if (state) whereClause.state = { [Op.like]: `%${state}%` };
    if (is_active !== undefined) whereClause.is_active = is_active === 'true';

    // Get branches with pagination
    const offset = (page - 1) * limit;
    const { count, rows: branches } = await Branch.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: User,
                as: 'manager',
                attributes: ['id', 'first_name', 'last_name', 'email'],
                required: false
            }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    logger.info(`Found ${count} branches`);

    res.json({
        success: true,
        data: {
            branches,
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: count,
                per_page: parseInt(limit)
            }
        }
    });
});

/**
 * @desc Get branch by ID
 * @route GET /api/branches/:id
 * @access Private (Manager/Admin)
 */
const getBranch = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    logger.info(`Getting branch ${id} for user: ${userId}`);

    const branch = await Branch.findOne({
        where: { id },
        include: [
            {
                model: User,
                as: 'manager',
                attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
                required: false
            },
            {
                model: User,
                as: 'customers',
                attributes: ['id', 'first_name', 'last_name', 'email', 'is_active'],
                limit: 10 // Latest 10 customers
            }
        ]
    });

    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    logger.info(`Found branch: ${branch.branch_name}`);

    res.json({
        success: true,
        data: { branch }
    });
});

/**
 * @desc Create new branch
 * @route POST /api/branches
 * @access Private (Admin only)
 */
const createBranch = catchAsync(async (req, res, next) => {
    const {
        branch_code,
        branch_name,
        address,
        city,
        state,
        postal_code,
        country = 'Israel',
        phone,
        email,
        manager_id,
        opening_hours,
        services_offered
    } = req.body;
    const userId = req.user.id;

    logger.info(`Creating branch for user: ${userId}`, req.body);

    // Check if user is admin
    if (req.user.role !== 'admin') {
        throw new AppError('Only administrators can create branches', 403);
    }

    // Validate required fields
    if (!branch_name || !address || !city || !state || !postal_code || !phone || !email) {
        throw new AppError('All required fields must be provided', 400);
    }

    // Validate manager if provided
    if (manager_id) {
        const manager = await User.findOne({
            where: {
                id: manager_id,
                role: 'manager',
                is_active: true
            }
        });

        if (!manager) {
            throw new AppError('Invalid manager ID or manager is not active', 400);
        }

        // Check if manager is already assigned to another branch
        const existingBranch = await Branch.findOne({
            where: { manager_id, is_active: true }
        });

        if (existingBranch) {
            throw new AppError('Manager is already assigned to another branch', 400);
        }
    }

    // Check for duplicate branch code
    if (branch_code) {
        const existingBranch = await Branch.findOne({
            where: { branch_code }
        });

        if (existingBranch) {
            throw new AppError('Branch code already exists', 400);
        }
    }

    // Create branch
    const branchData = {
        branch_code,
        branch_name,
        address,
        city,
        state,
        postal_code,
        country,
        phone,
        email,
        manager_id,
        opening_hours: opening_hours || {
            monday: '08:30-17:00',
            tuesday: '08:30-17:00',
            wednesday: '08:30-17:00',
            thursday: '08:30-17:00',
            friday: '08:30-13:00',
            saturday: 'closed',
            sunday: '09:00-15:00'
        },
        services_offered: services_offered || [
            'personal_banking',
            'business_banking',
            'loans',
            'mortgages',
            'investments'
        ]
    };

    const branch = await Branch.create(branchData);

    logger.info(`Branch created successfully: ${branch.id} - ${branch.branch_name}`);

    // Log branch creation audit event
    await AuditService.logSystem({
        level: 'info',
        message: `New branch created: ${branch.branch_name} (${branch.branch_code})`,
        service: 'branch_management',
        meta: {
            branchId: branch.id,
            branchCode: branch.branch_code,
            branchName: branch.branch_name,
            city: branch.city,
            managerId: branch.manager_id,
            createdBy: userId
        }
    });

    res.status(201).json({
        success: true,
        message: 'Branch created successfully',
        data: { branch }
    });
});

/**
 * @desc Update branch
 * @route PUT /api/branches/:id
 * @access Private (Admin/Manager)
 */
const updateBranch = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const {
        branch_name,
        address,
        city,
        state,
        postal_code,
        country,
        phone,
        email,
        manager_id,
        is_active,
        opening_hours,
        services_offered
    } = req.body;
    const userId = req.user.id;

    logger.info(`Updating branch ${id} for user: ${userId}`);

    // Find branch
    const branch = await Branch.findByPk(id);
    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    // Authorization check
    if (req.user.role !== 'admin' && branch.manager_id !== userId) {
        throw new AppError('Not authorized to update this branch', 403);
    }

    // Validate manager if being updated
    if (manager_id && manager_id !== branch.manager_id) {
        const manager = await User.findOne({
            where: {
                id: manager_id,
                role: 'manager',
                is_active: true
            }
        });

        if (!manager) {
            throw new AppError('Invalid manager ID or manager is not active', 400);
        }

        // Check if manager is already assigned to another branch
        const existingBranch = await Branch.findOne({
            where: {
                manager_id,
                is_active: true,
                id: { [Op.ne]: id } // Exclude current branch
            }
        });

        if (existingBranch) {
            throw new AppError('Manager is already assigned to another branch', 400);
        }
    }

    // Prepare update data
    const updateData = {};
    if (branch_name) updateData.branch_name = branch_name;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (postal_code) updateData.postal_code = postal_code;
    if (country) updateData.country = country;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (manager_id !== undefined) updateData.manager_id = manager_id;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (opening_hours) updateData.opening_hours = opening_hours;
    if (services_offered) updateData.services_offered = services_offered;

    if (Object.keys(updateData).length === 0) {
        throw new AppError('No valid fields to update', 400);
    }

    const updatedBranch = await branch.update(updateData);

    logger.info(`Branch updated successfully: ${id}`);

    // Log branch update audit event
    await AuditService.logSystem({
        level: 'info',
        message: `Branch updated: ${branch.branch_name} (${branch.branch_code})`,
        service: 'branch_management',
        meta: {
            branchId: branch.id,
            updatedFields: Object.keys(updateData),
            updatedBy: userId
        }
    });

    res.json({
        success: true,
        message: 'Branch updated successfully',
        data: { branch: updatedBranch }
    });
});

/**
 * @desc Delete branch (soft delete)
 * @route DELETE /api/branches/:id
 * @access Private (Admin only)
 */
const deleteBranch = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    logger.info(`Deleting branch ${id} for user: ${userId}`);

    // Check if user is admin
    if (req.user.role !== 'admin') {
        throw new AppError('Only administrators can delete branches', 403);
    }

    // Find branch
    const branch = await Branch.findByPk(id);
    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    // Check if branch has active customers
    const customerCount = await User.count({
        where: {
            branch_id: id,
            is_active: true
        }
    });

    if (customerCount > 0) {
        throw new AppError('Cannot delete branch with active customers', 400);
    }

    // Soft delete branch
    await branch.destroy();

    logger.info(`Branch deleted successfully: ${id}`);

    // Log branch deletion audit event
    await AuditService.logSystem({
        level: 'warning',
        message: `Branch deleted: ${branch.branch_name} (${branch.branch_code})`,
        service: 'branch_management',
        meta: {
            branchId: branch.id,
            branchCode: branch.branch_code,
            branchName: branch.branch_name,
            deletedBy: userId
        }
    });

    res.json({
        success: true,
        message: 'Branch deleted successfully'
    });
});

/**
 * @desc Get branch customers
 * @route GET /api/branches/:id/customers
 * @access Private (Manager/Admin)
 */
const getBranchCustomers = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { page = 1, limit = 20, search, status } = req.query;
    const userId = req.user.id;

    logger.info(`Getting customers for branch ${id}`);

    // Check branch exists and user has access
    const branch = await Branch.findByPk(id);
    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    // Authorization check
    if (req.user.role !== 'admin' && branch.manager_id !== userId) {
        throw new AppError('Not authorized to view this branch customers', 403);
    }

    // Build where clause
    const whereClause = { branch_id: id };

    if (search) {
        whereClause[Op.or] = [
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { username: { [Op.like]: `%${search}%` } }
        ];
    }

    if (status) {
        whereClause.is_active = status === 'active';
    }

    // Get customers with pagination
    const offset = (page - 1) * limit;
    const { count, rows: customers } = await User.findAndCountAll({
        where: whereClause,
        attributes: [
            'id', 'username', 'first_name', 'last_name', 'email',
            'phone', 'is_active', 'last_login', 'created_at'
        ],
        include: [
            {
                model: Account,
                as: 'accounts',
                attributes: ['id', 'account_number', 'account_type', 'balance', 'is_active']
            }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
        success: true,
        data: {
            customers,
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: count,
                per_page: parseInt(limit)
            }
        }
    });
});

/**
 * @desc Get branch statistics
 * @route GET /api/branches/:id/stats
 * @access Private (Manager/Admin)
 */
const getBranchStats = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { period = '30', start_date, end_date } = req.query;
    const userId = req.user.id;

    logger.info(`Getting statistics for branch ${id}`);

    // Check branch exists and user has access
    const branch = await Branch.findByPk(id);
    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    // Authorization check
    if (req.user.role !== 'admin' && branch.manager_id !== userId) {
        throw new AppError('Not authorized to view this branch statistics', 403);
    }

    // Calculate date range
    let startDate, endDate;
    if (start_date && end_date) {
        startDate = new Date(start_date);
        endDate = new Date(end_date);
    } else {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));
    }

    // Get statistics
    const stats = await BranchStatistics.findAll({
        where: {
            branch_id: id,
            date: {
                [Op.between]: [startDate, endDate]
            }
        },
        order: [['date', 'DESC']]
    });

    // Calculate totals and averages
    const totals = stats.reduce((acc, stat) => ({
        totalCustomers: Math.max(acc.totalCustomers, stat.total_customers),
        newCustomers: acc.newCustomers + stat.new_customers_today,
        totalAccounts: Math.max(acc.totalAccounts, stat.active_accounts),
        totalDeposits: acc.totalDeposits + stat.total_deposits,
        totalWithdrawals: acc.totalWithdrawals + stat.total_withdrawals,
        totalLoans: acc.totalLoans + stat.total_loans,
        pendingLoans: Math.max(acc.pendingLoans, stat.pending_loan_applications),
        totalTransactions: acc.totalTransactions + stat.transactions_count,
        totalRevenue: acc.totalRevenue + stat.revenue
    }), {
        totalCustomers: 0, newCustomers: 0, totalAccounts: 0,
        totalDeposits: 0, totalWithdrawals: 0, totalLoans: 0,
        pendingLoans: 0, totalTransactions: 0, totalRevenue: 0
    });

    // Calculate averages
    const dayCount = stats.length || 1;
    const averages = {
        avgCustomersPerDay: totals.newCustomers / dayCount,
        avgTransactionsPerDay: totals.totalTransactions / dayCount,
        avgRevenuePerDay: totals.totalRevenue / dayCount,
        avgSatisfactionScore: stats.reduce((sum, s) => sum + (s.customer_satisfaction_score || 0), 0) / dayCount
    };

    res.json({
        success: true,
        data: {
            branch: {
                id: branch.id,
                name: branch.branch_name,
                code: branch.branch_code
            },
            period: {
                start_date: startDate,
                end_date: endDate,
                days: dayCount
            },
            statistics: stats,
            summary: {
                totals,
                averages,
                netCashFlow: totals.totalDeposits - totals.totalWithdrawals
            }
        }
    });
});

/**
 * @desc Get branch loan applications
 * @route GET /api/branches/:id/loans
 * @access Private (Manager/Admin)
 */
const getBranchLoans = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { page = 1, limit = 20, status, loan_type } = req.query;
    const userId = req.user.id;

    logger.info(`Getting loan applications for branch ${id}`);

    // Check branch exists and user has access
    const branch = await Branch.findByPk(id);
    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    // Authorization check
    if (req.user.role !== 'admin' && branch.manager_id !== userId) {
        throw new AppError('Not authorized to view this branch loan applications', 403);
    }

    // Build where clause for loans
    const whereClause = { branch_id: id };
    if (status) whereClause.status = status;
    if (loan_type) whereClause.loan_type = loan_type;

    // Get loans with pagination
    const offset = (page - 1) * limit;
    const { count, rows: loans } = await Loan.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: User,
                as: 'borrower',
                attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
            },
            {
                model: User,
                as: 'approver',
                attributes: ['id', 'first_name', 'last_name'],
                required: false
            }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    // Add calculated fields to each loan
    const loansWithCalculations = loans.map(loan => {
        const loanData = loan.toJSON();
        return {
            ...loanData,
            monthlyPayment: loan.calculateMonthlyPayment(),
            monthly_payment_calculated: loan.calculateMonthlyPayment(),
            totalInterest: loan.calculateTotalInterest(),
            total_interest: loan.calculateTotalInterest(),
            remainingBalance: loan.calculateRemainingBalance(),
            remaining_balance: loan.calculateRemainingBalance(),
            nextPaymentDue: loan.getNextPaymentDue(),
            next_payment_due: loan.getNextPaymentDue(),
            isOverdue: loan.isOverdue(),
            is_overdue: loan.isOverdue(),
            daysOverdue: loan.getDaysOverdue(),
            progressPercentage: loan.getProgressPercentage()
        };
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
        success: true,
        data: {
            loans: loansWithCalculations,
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: count,
                per_page: parseInt(limit)
            }
        }
    });
});

/**
 * @desc Get pending users for branch approval
 * @route GET /api/branches/:id/pending-users
 * @access Private (Manager/Admin)
 */
const getPendingUsers = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    logger.info(`Getting pending users for branch ${id}`);

    // Check branch exists and user has access
    const branch = await Branch.findByPk(id);
    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    // Authorization check
    if (req.user.role !== 'admin' && branch.manager_id !== userId) {
        throw new AppError('Not authorized to view pending users for this branch', 403);
    }

    // Get all pending users for this branch
    const pendingUsers = await User.findAll({
        where: {
            approval_status: 'pending',
            pending_branch_id: id
        },
        attributes: [
            'id', 'username', 'first_name', 'last_name', 'email',
            'phone', 'created_at', 'approval_status', 'pending_branch_id'
        ],
        order: [['created_at', 'ASC']]
    });

    logger.info(`Found ${pendingUsers.length} pending users for branch ${id}`);

    res.json({
        success: true,
        data: {
            pendingUsers,
            count: pendingUsers.length
        }
    });
});

/**
 * @desc Approve a user for branch membership
 * @route PUT /api/branches/:id/approve-user/:userId
 * @access Private (Manager/Admin)
 */
const approveUser = catchAsync(async (req, res, next) => {
    const { id: branchId, userId } = req.params;
    const managerId = req.user.id;

    logger.info(`Approving user ${userId} for branch ${branchId} by manager ${managerId}`);

    // Check branch exists and user has access
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    // Authorization check
    if (req.user.role !== 'admin' && branch.manager_id !== managerId) {
        throw new AppError('Not authorized to approve users for this branch', 403);
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Check if user is pending for this branch
    if (user.approval_status !== 'pending' || user.pending_branch_id !== parseInt(branchId)) {
        throw new AppError('User is not pending approval for this branch', 400);
    }

    // Approve the user
    await user.update({
        branch_id: branchId,
        approval_status: 'approved',
        approved_by: managerId,
        approved_at: new Date(),
        pending_branch_id: null
    });

    logger.info(`User ${userId} approved for branch ${branchId}`);

    // Log approval audit event
    await AuditService.logSystem({
        level: 'info',
        message: `User approved for branch: ${user.username} approved by manager ${req.user.username}`,
        service: 'user_approval',
        meta: {
            userId: user.id,
            branchId: branchId,
            approvedBy: managerId,
            userEmail: user.email
        }
    });

    res.json({
        success: true,
        message: 'User approved successfully',
        data: {
            user: {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                branch_id: user.branch_id,
                approval_status: user.approval_status,
                approved_at: user.approved_at
            }
        }
    });
});

/**
 * @desc Reject a user's branch membership request
 * @route PUT /api/branches/:id/reject-user/:userId
 * @access Private (Manager/Admin)
 */
const rejectUser = catchAsync(async (req, res, next) => {
    const { id: branchId, userId } = req.params;
    const { reason } = req.body;
    const managerId = req.user.id;

    logger.info(`Rejecting user ${userId} for branch ${branchId} by manager ${managerId}`);

    // Check branch exists and user has access
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    // Authorization check
    if (req.user.role !== 'admin' && branch.manager_id !== managerId) {
        throw new AppError('Not authorized to reject users for this branch', 403);
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Check if user is pending for this branch
    if (user.approval_status !== 'pending' || user.pending_branch_id !== parseInt(branchId)) {
        throw new AppError('User is not pending approval for this branch', 400);
    }

    // Reject the user
    await user.update({
        approval_status: 'rejected',
        rejected_by: managerId,
        rejected_at: new Date(),
        rejection_reason: reason || 'No reason provided',
        pending_branch_id: null
    });

    logger.info(`User ${userId} rejected for branch ${branchId}`);

    // Log rejection audit event
    await AuditService.logSystem({
        level: 'warning',
        message: `User rejected for branch: ${user.username} rejected by manager ${req.user.username}`,
        service: 'user_approval',
        meta: {
            userId: user.id,
            branchId: branchId,
            rejectedBy: managerId,
            reason: reason,
            userEmail: user.email
        }
    });

    res.json({
        success: true,
        message: 'User rejected successfully'
    });
});

module.exports = {
    getBranches,
    getBranch,
    createBranch,
    updateBranch,
    deleteBranch,
    getBranchCustomers,
    getBranchStats,
    getBranchLoans,
    getPendingUsers,
    approveUser,
    rejectUser
};
