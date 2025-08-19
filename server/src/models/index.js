const { sequelize } = require('../config/database');

// Import all models
const User = require('./User.model');
const Account = require('./Account.model');
const Transaction = require('./Transaction.model');
const Card = require('./Card.model');
const Loan = require('./Loan.model');
const StandingOrder = require('./StandingOrder.model');
const StockTransaction = require('./StockTransaction.model');
const Portfolio = require('./Portfolio.model');
const Watchlist = require('./Watchlist.model');
const StockQuote = require('./StockQuote.model');
const Branch = require('./Branch.model');
const BranchStatistics = require('./BranchStatistics.model');
const BranchReport = require('./BranchReport.model');

// Define model associations
const setupAssociations = () => {
    // User associations
    User.hasMany(Account, {
        foreignKey: 'user_id',
        as: 'accounts',
        onDelete: 'CASCADE'
    });

    User.hasMany(Loan, {
        foreignKey: 'user_id',
        as: 'loans',
        onDelete: 'CASCADE'
    });

    User.hasMany(Transaction, {
        foreignKey: 'initiated_by',
        as: 'initiatedTransactions',
        onDelete: 'SET NULL'
    });

    User.hasMany(Transaction, {
        foreignKey: 'authorized_by',
        as: 'authorizedTransactions',
        onDelete: 'SET NULL'
    });

    User.hasMany(Loan, {
        foreignKey: 'approved_by',
        as: 'approvedLoans',
        onDelete: 'SET NULL'
    });

    User.hasMany(StandingOrder, {
        foreignKey: 'created_by',
        as: 'standingOrders',
        onDelete: 'CASCADE'
    });

    // Account associations
    Account.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    Account.hasMany(Card, {
        foreignKey: 'account_id',
        as: 'cards',
        onDelete: 'CASCADE'
    });

    Account.hasMany(Transaction, {
        foreignKey: 'from_account_id',
        as: 'outgoingTransactions',
        onDelete: 'SET NULL'
    });

    Account.hasMany(Transaction, {
        foreignKey: 'to_account_id',
        as: 'incomingTransactions',
        onDelete: 'SET NULL'
    });

    Account.hasMany(StandingOrder, {
        foreignKey: 'from_account_id',
        as: 'outgoingStandingOrders',
        onDelete: 'CASCADE'
    });

    Account.hasMany(StandingOrder, {
        foreignKey: 'to_account_id',
        as: 'incomingStandingOrders',
        onDelete: 'SET NULL'
    });

    // Transaction associations
    Transaction.belongsTo(Account, {
        foreignKey: 'from_account_id',
        as: 'fromAccount'
    });

    Transaction.belongsTo(Account, {
        foreignKey: 'to_account_id',
        as: 'toAccount'
    });

    Transaction.belongsTo(User, {
        foreignKey: 'initiated_by',
        as: 'initiator'
    });

    Transaction.belongsTo(User, {
        foreignKey: 'authorized_by',
        as: 'authorizer'
    });

    // Card associations
    Card.belongsTo(Account, {
        foreignKey: 'account_id',
        as: 'account'
    });

    Card.belongsTo(Card, {
        foreignKey: 'replacement_for',
        as: 'replacedCard'
    });

    Card.hasOne(Card, {
        foreignKey: 'replacement_for',
        as: 'replacementCard'
    });

    // Loan associations
    Loan.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'borrower'
    });

    Loan.belongsTo(User, {
        foreignKey: 'approved_by',
        as: 'approver'
    });

    // Standing Order associations
    StandingOrder.belongsTo(Account, {
        foreignKey: 'from_account_id',
        as: 'fromAccount'
    });

    StandingOrder.belongsTo(Account, {
        foreignKey: 'to_account_id',
        as: 'toAccount'
    });

    StandingOrder.belongsTo(User, {
        foreignKey: 'created_by',
        as: 'creator'
    });

    // Stock Transaction associations
    StockTransaction.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    User.hasMany(StockTransaction, {
        foreignKey: 'user_id',
        as: 'stockTransactions',
        onDelete: 'CASCADE'
    });

    // Portfolio associations
    Portfolio.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    User.hasMany(Portfolio, {
        foreignKey: 'user_id',
        as: 'portfolioHoldings',
        onDelete: 'CASCADE'
    });

    // Watchlist associations
    Watchlist.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    User.hasMany(Watchlist, {
        foreignKey: 'user_id',
        as: 'watchlistItems',
        onDelete: 'CASCADE'
    });

    // Branch associations
    Branch.belongsTo(User, {
        foreignKey: 'manager_id',
        as: 'manager'
    });

    User.hasOne(Branch, {
        foreignKey: 'manager_id',
        as: 'managedBranch',
        onDelete: 'SET NULL'
    });

    // Branch-Customer associations
    Branch.hasMany(User, {
        foreignKey: 'branch_id',
        as: 'customers'
    });

    User.belongsTo(Branch, {
        foreignKey: 'branch_id',
        as: 'branch'
    });

    // Branch Statistics associations
    BranchStatistics.belongsTo(Branch, {
        foreignKey: 'branch_id',
        as: 'branch'
    });

    Branch.hasMany(BranchStatistics, {
        foreignKey: 'branch_id',
        as: 'statistics',
        onDelete: 'CASCADE'
    });

    // Branch Reports associations
    BranchReport.belongsTo(Branch, {
        foreignKey: 'branch_id',
        as: 'branch'
    });

    BranchReport.belongsTo(User, {
        foreignKey: 'generated_by',
        as: 'generator'
    });

    Branch.hasMany(BranchReport, {
        foreignKey: 'branch_id',
        as: 'reports',
        onDelete: 'CASCADE'
    });

    User.hasMany(BranchReport, {
        foreignKey: 'generated_by',
        as: 'generatedReports',
        onDelete: 'SET NULL'
    });

    console.log('✅ Model associations established');
};

// Initialize associations
setupAssociations();

// Export all models and sequelize instance
module.exports = {
    sequelize,
    User,
    Account,
    Transaction,
    Card,
    Loan,
    StandingOrder,
    StockTransaction,
    Portfolio,
    Watchlist,
    StockQuote,
    Branch,
    BranchStatistics,
    BranchReport,

    // Helper function to sync all models
    syncModels: async (options = {}) => {
        try {
            await sequelize.sync(options);
            console.log('✅ All models synchronized successfully');
        } catch (error) {
            console.error('❌ Error synchronizing models:', error.message);
            throw error;
        }
    },

    // Helper function to authenticate database connection
    testConnection: async () => {
        try {
            await sequelize.authenticate();
            console.log('✅ Database connection test successful');
            return true;
        } catch (error) {
            console.error('❌ Database connection test failed:', error.message);
            return false;
        }
    },

    // Helper function to close database connection
    closeConnection: async () => {
        try {
            await sequelize.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing database connection:', error.message);
        }
    }
};
