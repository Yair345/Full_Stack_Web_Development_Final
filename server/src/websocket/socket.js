const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt.utils');
const { User } = require('../models');

let io;

/**
 * Initialize Socket.IO
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
const initSocketIO = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                return next(new Error('Authentication token required'));
            }

            // Verify JWT token
            const decoded = verifyAccessToken(token);

            // Get user from database
            const user = await User.findByPk(decoded.id, {
                attributes: ['id', 'username', 'email', 'role', 'is_active']
            });

            if (!user || !user.is_active) {
                return next(new Error('Invalid user or user inactive'));
            }

            // Attach user to socket
            socket.user = user;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error.message);
            next(new Error('Authentication failed'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        console.log(`User ${socket.user.username} connected (${socket.id})`);

        // Join user to their personal room
        socket.join(`user_${socket.user.id}`);

        // Join role-based rooms
        socket.join(`role_${socket.user.role}`);

        // Handle socket events
        setupSocketHandlers(socket);

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`User ${socket.user.username} disconnected: ${reason}`);
        });

        // Send welcome message
        socket.emit('connected', {
            message: 'Connected successfully',
            user: socket.user.username,
            timestamp: new Date().toISOString()
        });
    });

    console.log('✅ Socket.IO initialized');
    return io;
};

/**
 * Setup socket event handlers
 * @param {Object} socket - Socket instance
 */
const setupSocketHandlers = (socket) => {
    // Handle joining account-specific rooms
    socket.on('join_account', (accountId) => {
        // Verify user owns this account (you'd check database here)
        socket.join(`account_${accountId}`);
        socket.emit('joined_account', { accountId });
    });

    // Handle leaving account-specific rooms
    socket.on('leave_account', (accountId) => {
        socket.leave(`account_${accountId}`);
        socket.emit('left_account', { accountId });
    });

    // Handle real-time balance requests
    socket.on('get_balance', async (data) => {
        try {
            // Get balance from database (implement your logic here)
            const { Account } = require('../models');
            const account = await Account.findOne({
                where: {
                    id: data.accountId,
                    user_id: socket.user.id
                }
            });

            if (account) {
                socket.emit('balance_update', {
                    accountId: data.accountId,
                    balance: account.balance,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            socket.emit('error', { message: 'Failed to get balance' });
        }
    });

    // Handle transaction status updates
    socket.on('subscribe_transaction', (transactionId) => {
        socket.join(`transaction_${transactionId}`);
    });

    socket.on('unsubscribe_transaction', (transactionId) => {
        socket.leave(`transaction_${transactionId}`);
    });

    // Handle admin notifications (admin/manager only)
    socket.on('subscribe_admin_notifications', () => {
        if (socket.user.role === 'admin' || socket.user.role === 'manager') {
            socket.join('admin_notifications');
        }
    });

    // Handle ping/pong for connection testing
    socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.user.username}:`, error);
    });
};

/**
 * Get Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

/**
 * Emit to user's room
 * @param {Number} userId - User ID
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToUser = (userId, event, data) => {
    if (!io) return;

    io.to(`user_${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Emit to account room
 * @param {Number} accountId - Account ID
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToAccount = (accountId, event, data) => {
    if (!io) return;

    io.to(`account_${accountId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Emit to role-based room
 * @param {String} role - User role
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToRole = (role, event, data) => {
    if (!io) return;

    io.to(`role_${role}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Emit balance update
 * @param {Number} accountId - Account ID
 * @param {Number} newBalance - New balance
 * @param {Object} transaction - Transaction data
 */
const emitBalanceUpdate = (accountId, newBalance, transaction = null) => {
    emitToAccount(accountId, 'balance_update', {
        accountId,
        balance: newBalance,
        transaction
    });
};

/**
 * Emit transaction status update
 * @param {String} transactionId - Transaction ID
 * @param {String} status - New status
 * @param {Object} details - Additional details
 */
const emitTransactionUpdate = (transactionId, status, details = {}) => {
    if (!io) return;

    io.to(`transaction_${transactionId}`).emit('transaction_update', {
        transactionId,
        status,
        ...details,
        timestamp: new Date().toISOString()
    });
};

/**
 * Emit admin notification
 * @param {String} type - Notification type
 * @param {Object} data - Notification data
 */
const emitAdminNotification = (type, data) => {
    if (!io) return;

    io.to('admin_notifications').emit('admin_notification', {
        type,
        ...data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Emit new transaction notification
 * @param {Number} userId - User ID
 * @param {Object} transaction - Transaction data
 */
const emitNewTransaction = (userId, transaction) => {
    emitToUser(userId, 'new_transaction', {
        transaction,
        message: `New ${transaction.transaction_type} of ${transaction.getFormattedAmount()}`
    });
};

/**
 * Emit payment status update
 * @param {Number} userId - User ID
 * @param {Object} payment - Payment data
 */
const emitPaymentStatus = (userId, payment) => {
    emitToUser(userId, 'payment_status', {
        payment,
        message: `Payment ${payment.status}`
    });
};

module.exports = {
    initSocketIO,
    getIO,
    emitToUser,
    emitToAccount,
    emitToRole,
    emitBalanceUpdate,
    emitTransactionUpdate,
    emitAdminNotification,
    emitNewTransaction,
    emitPaymentStatus
};
