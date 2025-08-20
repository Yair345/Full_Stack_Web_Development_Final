const { User, Branch, Account, Loan, Transaction, sequelize } = require('../models');
const { AppError } = require('../utils/error.utils');
const { catchAsync } = require('../middleware/error.middleware');
const { requestLogger: logger } = require('../middleware/logger.middleware');
const AuditService = require('../services/audit.service');
const { Op } = require('sequelize');
const { USER_ROLES } = require('../utils/constants');

/**
 * @desc Get admin dashboard overview
 * @route GET /api/admin/overview
 * @access Private (Admin only)
 */
const getAdminOverview = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    logger.info(`Getting admin overview for user: ${userId}`);

    // Get system statistics
    const [
        totalUsers,
        activeUsers,
        totalBranches,
        activeBranches,
        totalAccounts,
        totalLoans,
        pendingLoans,
        todayTransactions,
        totalTransactionVolume
    ] = await Promise.all([
        User.count(),
        User.count({ where: { is_active: true } }),
        Branch.count(),
        Branch.count({ where: { is_active: true } }),
        Account.count({ where: { is_active: true } }),
        Loan.count(),
        Loan.count({ where: { status: 'pending' } }),
        Transaction.count({
            where: {
                created_at: {
                    [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        }),
        Transaction.sum('amount', {
            where: {
                status: 'completed'
            }
        })
    ]);

    // Get recent activity (last 50 records)
    const recentActivity = await AuditService.getRecentActivity(50);

    // Get system alerts (mock data for now)
    const systemAlerts = [
        {
            id: 1,
            title: "High Volume Detected",
            description: "Transaction volume is 150% above normal",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            severity: "warning",
            type: "volume"
        },
        {
            id: 2,
            title: "Security Scan Complete",
            description: "Weekly security scan completed successfully",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            severity: "info",
            type: "security"
        }
    ];

    const systemStats = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalBranches: totalBranches || 0,
        activeBranches: activeBranches || 0,
        totalAccounts: totalAccounts || 0,
        totalLoans: totalLoans || 0,
        pendingLoans: pendingLoans || 0,
        todayTransactions: todayTransactions || 0,
        totalTransactionVolume: totalTransactionVolume || 0,
        systemHealth: 98.5 // Mock data
    };

    logger.info(`Admin overview retrieved successfully`);

    res.json({
        success: true,
        data: {
            systemStats,
            recentActivity,
            systemAlerts
        }
    });
});

/**
 * @desc Get all users for admin management
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
const getUsers = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, search, status, role } = req.query;
    const userId = req.user.id;

    logger.info(`Getting users for admin management by user: ${userId}`);

    // Build where clause
    const whereClause = {};

    if (search) {
        whereClause[Op.or] = [
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { username: { [Op.like]: `%${search}%` } }
        ];
    }

    if (status) {
        if (status === 'active') whereClause.is_active = true;
        if (status === 'inactive') whereClause.is_active = false;
        if (status === 'pending') whereClause.approval_status = 'pending';
        if (status === 'rejected') whereClause.approval_status = 'rejected';
    }

    if (role && role !== 'all') {
        whereClause.role = role;
    }

    // Get users with pagination
    const offset = (page - 1) * limit;
    const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: Branch,
                as: 'branch',
                attributes: ['id', 'branch_name', 'city'],
                required: false
            },
            {
                model: Account,
                as: 'accounts',
                attributes: ['id', 'account_type', 'balance', 'is_active'],
                required: false
            }
        ],
        attributes: [
            'id', 'username', 'first_name', 'last_name', 'email', 'phone',
            'role', 'is_active', 'approval_status', 'last_login', 'created_at',
            'branch_id'
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    // Add calculated fields
    const usersWithStats = users.map(user => {
        const userData = user.toJSON();
        return {
            ...userData,
            totalBalance: userData.accounts ?
                userData.accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0) : 0,
            accountsCount: userData.accounts ? userData.accounts.length : 0
        };
    });

    logger.info(`Found ${count} users`);

    res.json({
        success: true,
        data: {
            users: usersWithStats,
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
 * @desc Update user status (activate, deactivate, approve, reject)
 * @route PUT /api/admin/users/:id/status
 * @access Private (Admin only)
 */
const updateUserStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { action, reason } = req.body;
    const adminId = req.user.id;

    logger.info(`Updating user ${id} status to ${action} by admin ${adminId}`);
    logger.info(`Request body:`, req.body);
    logger.info(`Request params:`, req.params);

    // Validate action
    const validActions = ['activate', 'deactivate', 'approve', 'reject', 'suspend', 'unsuspend'];
    if (!validActions.includes(action)) {
        throw new AppError('Invalid action provided', 400);
    }

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Prevent admin from modifying their own status
    if (parseInt(id) === adminId) {
        throw new AppError('Cannot modify your own status', 400);
    }

    // Prepare update data based on action
    let updateData = {};
    let auditMessage = '';

    switch (action) {
        case 'activate':
            updateData = { is_active: true };
            auditMessage = `User activated by admin`;
            break;
        case 'deactivate':
            updateData = { is_active: false };
            auditMessage = `User deactivated by admin`;
            break;
        case 'suspend':
            updateData = { is_active: false };
            auditMessage = `User suspended by admin - Reason: ${reason || 'No reason provided'}`;
            break;
        case 'unsuspend':
            updateData = { is_active: true };
            auditMessage = `User unsuspended by admin`;
            break;
        case 'approve':
            if (user.approval_status !== 'pending') {
                throw new AppError('User is not pending approval', 400);
            }
            updateData = {
                approval_status: 'approved',
                approved_by: adminId,
                approved_at: new Date(),
                is_active: true
            };
            auditMessage = `User approved by admin`;
            break;
        case 'reject':
            if (user.approval_status !== 'pending') {
                throw new AppError('User is not pending approval', 400);
            }
            updateData = {
                approval_status: 'rejected',
                approved_by: adminId,
                approved_at: new Date(),
                rejection_reason: reason || 'No reason provided',
                is_active: false
            };
            auditMessage = `User rejected by admin`;
            break;
    }

    // Update user
    await user.update(updateData);

    logger.info(`User ${id} status updated successfully`);

    // Log audit event
    await AuditService.logSystem({
        level: 'info',
        message: `${auditMessage}: ${user.username} (${user.email})`,
        service: 'admin_user_management',
        meta: {
            userId: user.id,
            adminId,
            action,
            reason,
            userEmail: user.email,
            userName: user.username
        }
    });

    res.json({
        success: true,
        message: `User ${action}d successfully`,
        data: {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                is_active: user.is_active,
                approval_status: user.approval_status
            }
        }
    });
});

/**
 * @desc Get single user by ID for admin management
 * @route GET /api/admin/users/:id
 * @access Private (Admin only)
 */
const getUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const adminId = req.user.id;
    const currentUser = req.user;

    logger.info(`Getting user ${id} details for ${currentUser.role}: ${adminId}`);

    // Find user
    const user = await User.findByPk(id, {
        include: [
            {
                model: Branch,
                as: 'branch',
                attributes: ['id', 'branch_name', 'city'],
                required: false
            },
            {
                model: Account,
                as: 'accounts',
                attributes: ['id', 'account_type', 'balance', 'is_active'],
                required: false
            }
        ],
        attributes: [
            'id', 'username', 'first_name', 'last_name', 'email', 'phone',
            'role', 'is_active', 'approval_status', 'last_login', 'created_at',
            'branch_id', 'address', 'date_of_birth', 'national_id', 'is_verified'
        ]
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Authorization check for managers - they can only access users in their branch
    if (currentUser.role === USER_ROLES.MANAGER) {
        if (!currentUser.branch_id) {
            throw new AppError('Manager must be assigned to a branch', 400);
        }
        if (user.branch_id !== currentUser.branch_id) {
            throw new AppError('Access denied: You can only view users in your branch', 403);
        }
    }

    // Add calculated fields
    const userData = user.toJSON();
    userData.totalBalance = userData.accounts ?
        userData.accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0) : 0;
    userData.accountsCount = userData.accounts ? userData.accounts.length : 0;

    logger.info(`User ${id} details retrieved successfully`);

    res.json({
        success: true,
        data: { user: userData }
    });
});

/**
 * @desc Update user information
 * @route PUT /api/admin/users/:id
 * @access Private (Admin only)
 */
const updateUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const {
        first_name,
        last_name,
        email,
        phone,
        role,
        branch_id,
        address
    } = req.body;
    const adminId = req.user.id;
    const currentUser = req.user;

    logger.info(`Updating user ${id} by ${currentUser.role}: ${adminId}`);

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Authorization check for managers - they can only edit users in their branch
    if (currentUser.role === USER_ROLES.MANAGER) {
        if (!currentUser.branch_id) {
            throw new AppError('Manager must be assigned to a branch', 400);
        }
        if (user.branch_id !== currentUser.branch_id) {
            throw new AppError('Access denied: You can only edit users in your branch', 403);
        }
        // Managers cannot change user roles or branch assignments
        if (role || branch_id !== undefined) {
            throw new AppError('Access denied: Managers cannot change user roles or branch assignments', 403);
        }
    }

    // Prevent admin from modifying their own role or branch
    if (parseInt(id) === adminId && (role || branch_id)) {
        throw new AppError('Cannot modify your own role or branch assignment', 400);
    }

    // Validate email uniqueness if being updated
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new AppError('Email is already in use by another user', 400);
        }
    }

    // Validate branch if being updated
    if (branch_id && branch_id !== user.branch_id) {
        const branch = await Branch.findByPk(branch_id);
        if (!branch) {
            throw new AppError('Invalid branch ID', 400);
        }
    }

    // Prepare update data
    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (branch_id !== undefined) updateData.branch_id = branch_id;
    if (address) updateData.address = address;

    if (Object.keys(updateData).length === 0) {
        throw new AppError('No valid fields to update', 400);
    }

    const updatedUser = await user.update(updateData);

    logger.info(`User ${id} updated successfully by ${currentUser.role}: ${adminId}`);

    // Log audit event
    await AuditService.logSystem({
        level: 'info',
        message: `User updated by ${currentUser.role}: ${user.username} (${user.email})`,
        service: 'user_management',
        meta: {
            userId: user.id,
            updatedFields: Object.keys(updateData),
            updatedBy: adminId,
            updatedByRole: currentUser.role
        }
    });

    res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
    });
});

/**
 * @desc Delete user (soft delete)
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin only)
 */
const deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const adminId = req.user.id;

    logger.info(`Deleting user ${id} by admin: ${adminId}`);

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Prevent admin from deleting themselves
    if (parseInt(id) === adminId) {
        throw new AppError('Cannot delete your own account', 400);
    }

    // Check if user has active accounts with balance
    const activeAccounts = await Account.count({
        where: {
            user_id: id,
            is_active: true,
            balance: { [Op.gt]: 0 }
        }
    });

    if (activeAccounts > 0) {
        throw new AppError('Cannot delete user with active accounts containing funds', 400);
    }

    // Soft delete user
    await user.destroy();

    logger.info(`User ${id} deleted successfully by admin: ${adminId}`);

    // Log audit event
    await AuditService.logSystem({
        level: 'warning',
        message: `User deleted by admin: ${user.username} (${user.email})`,
        service: 'admin_user_management',
        meta: {
            userId: user.id,
            userEmail: user.email,
            userName: user.username,
            deletedBy: adminId
        }
    });

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});

/**
 * @desc Get all branches for admin management
 * @route GET /api/admin/branches
 * @access Private (Admin only)
 */
const getBranches = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, search, status } = req.query;
    const userId = req.user.id;

    logger.info(`Getting branches for admin management by user: ${userId}`);

    // Build where clause
    const whereClause = {};

    if (search) {
        whereClause[Op.or] = [
            { branch_name: { [Op.like]: `%${search}%` } },
            { city: { [Op.like]: `%${search}%` } },
            { state: { [Op.like]: `%${search}%` } },
            { branch_code: { [Op.like]: `%${search}%` } }
        ];
    }

    if (status) {
        whereClause.is_active = status === 'active';
    }

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
            },
            {
                model: User,
                as: 'customers',
                attributes: ['id'],
                required: false
            }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    // Add customer count to each branch
    const branchesWithStats = branches.map(branch => {
        const branchData = branch.toJSON();
        return {
            ...branchData,
            customerCount: branchData.customers ? branchData.customers.length : 0
        };
    });

    logger.info(`Found ${count} branches`);

    res.json({
        success: true,
        data: {
            branches: branchesWithStats,
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
 * @desc Get available managers for branch assignment
 * @route GET /api/admin/available-managers
 * @access Private (Admin only)
 */
const getAvailableManagers = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    logger.info(`Getting available managers for admin by user: ${userId}`);

    // Find all managers who are not currently assigned to any active branch
    const assignedManagerIds = await Branch.findAll({
        where: {
            is_active: true,
            manager_id: { [Op.ne]: null }
        },
        attributes: ['manager_id']
    }).then(branches => branches.map(b => b.manager_id));

    const availableManagers = await User.findAll({
        where: {
            role: 'manager',
            is_active: true,
            approval_status: 'approved',
            id: { [Op.notIn]: assignedManagerIds }
        },
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        order: [['first_name', 'ASC']]
    });

    logger.info(`Found ${availableManagers.length} available managers`);

    res.json({
        success: true,
        data: {
            managers: availableManagers
        }
    });
});

/**
 * @desc Create new branch
 * @route POST /api/admin/branches
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
    const adminId = req.user.id;

    logger.info(`Creating branch by admin: ${adminId}`, req.body);

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
                is_active: true,
                approval_status: 'approved'
            }
        });

        if (!manager) {
            throw new AppError('Invalid manager ID or manager is not active/approved', 400);
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

    logger.info(`Branch created successfully by admin: ${branch.id} - ${branch.branch_name}`);

    // Log branch creation audit event
    await AuditService.logSystem({
        level: 'info',
        message: `New branch created by admin: ${branch.branch_name} (${branch.branch_code})`,
        service: 'admin_branch_management',
        meta: {
            branchId: branch.id,
            branchCode: branch.branch_code,
            branchName: branch.branch_name,
            city: branch.city,
            managerId: branch.manager_id,
            createdBy: adminId
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
 * @route PUT /api/admin/branches/:id
 * @access Private (Admin only)
 */
const updateBranch = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const {
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
        is_active,
        opening_hours,
        services_offered
    } = req.body;
    const adminId = req.user.id;

    logger.info(`Updating branch ${id} by admin: ${adminId}`);

    // Find branch
    const branch = await Branch.findByPk(id);
    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    // Check for duplicate branch code if being updated
    if (branch_code && branch_code !== branch.branch_code) {
        const existingBranch = await Branch.findOne({
            where: { branch_code }
        });

        if (existingBranch) {
            throw new AppError('Branch code already exists', 400);
        }
    }

    // Validate manager if being updated
    if (manager_id && manager_id !== branch.manager_id) {
        const manager = await User.findOne({
            where: {
                id: manager_id,
                role: 'manager',
                is_active: true,
                approval_status: 'approved'
            }
        });

        if (!manager) {
            throw new AppError('Invalid manager ID or manager is not active/approved', 400);
        }

        // Check if manager is already assigned to another branch
        const existingBranch = await Branch.findOne({
            where: {
                manager_id,
                is_active: true,
                id: { [Op.ne]: id }
            }
        });

        if (existingBranch) {
            throw new AppError('Manager is already assigned to another branch', 400);
        }
    }

    // Prepare update data
    const updateData = {};
    if (branch_code !== undefined) updateData.branch_code = branch_code;
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

    logger.info(`Branch updated successfully by admin: ${id}`);

    // Log branch update audit event
    await AuditService.logSystem({
        level: 'info',
        message: `Branch updated by admin: ${branch.branch_name} (${branch.branch_code})`,
        service: 'admin_branch_management',
        meta: {
            branchId: branch.id,
            updatedFields: Object.keys(updateData),
            updatedBy: adminId
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
 * @route DELETE /api/admin/branches/:id
 * @access Private (Admin only)
 */
const deleteBranch = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const adminId = req.user.id;

    logger.info(`Deleting branch ${id} by admin: ${adminId}`);

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

    logger.info(`Branch deleted successfully by admin: ${id}`);

    // Log branch deletion audit event
    await AuditService.logSystem({
        level: 'warning',
        message: `Branch deleted by admin: ${branch.branch_name} (${branch.branch_code})`,
        service: 'admin_branch_management',
        meta: {
            branchId: branch.id,
            branchCode: branch.branch_code,
            branchName: branch.branch_name,
            deletedBy: adminId
        }
    });

    res.json({
        success: true,
        message: 'Branch deleted successfully'
    });
});

module.exports = {
    getAdminOverview,
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser,
    getBranches,
    getAvailableManagers,
    createBranch,
    updateBranch,
    deleteBranch
};
