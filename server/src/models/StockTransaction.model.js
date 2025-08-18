const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockTransaction = sequelize.define('StockTransaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'user_id'
    },
    transactionType: {
        type: DataTypes.ENUM('BUY', 'SELL'),
        allowNull: false,
        field: 'transaction_type'
    },
    stockSymbol: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'stock_symbol',
        validate: {
            isUppercase: true,
            len: [1, 10]
        }
    },
    stockName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'stock_name'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    pricePerShare: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        field: 'price_per_share',
        validate: {
            min: 0
        }
    },
    totalAmount: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        field: 'total_amount',
        validate: {
            min: 0
        }
    },
    fees: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'),
        defaultValue: 'PENDING'
    },
    executedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'executed_at'
    },
    marketPrice: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: true,
        field: 'market_price'
    },
    orderType: {
        type: DataTypes.ENUM('MARKET', 'LIMIT'),
        defaultValue: 'MARKET',
        field: 'order_type'
    },
    externalTransactionId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'external_transaction_id'
    }
}, {
    tableName: 'stock_transactions',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['stock_symbol']
        },
        {
            fields: ['user_id', 'stock_symbol']
        },
        {
            fields: ['user_id', 'created_at']
        },
        {
            fields: ['status']
        }
    ],
    hooks: {
        beforeValidate: (transaction) => {
            // Ensure stock symbol is uppercase
            if (transaction.stockSymbol) {
                transaction.stockSymbol = transaction.stockSymbol.toUpperCase();
            }
        },
        beforeSave: (transaction) => {
            // Calculate total amount if quantity or price changed
            if (transaction.changed('quantity') || transaction.changed('pricePerShare') || transaction.changed('fees')) {
                transaction.totalAmount = (parseFloat(transaction.quantity) * parseFloat(transaction.pricePerShare)) + parseFloat(transaction.fees || 0);
            }

            // Set executed_at when status changes to COMPLETED
            if (transaction.changed('status') && transaction.status === 'COMPLETED' && !transaction.executedAt) {
                transaction.executedAt = new Date();
            }
        }
    }
});

// Class methods
StockTransaction.getTransactionsByUser = async function (userId, options = {}) {
    const { limit = 50, offset = 0, stockSymbol, transactionType, status, startDate, endDate } = options;

    const whereClause = { userId };

    if (stockSymbol) whereClause.stockSymbol = stockSymbol;
    if (transactionType) whereClause.transactionType = transactionType;
    if (status) whereClause.status = status;

    if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = startDate;
        if (endDate) whereClause.createdAt[Op.lte] = endDate;
    }

    return this.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
    });
};

StockTransaction.getPortfolioSummary = async function (userId) {
    const transactions = await this.findAll({
        where: {
            userId,
            status: 'COMPLETED'
        },
        order: [['executedAt', 'ASC']]
    });

    const summary = {};
    let totalInvested = 0;
    let totalCurrentValue = 0;

    // Calculate holdings for each stock
    transactions.forEach(transaction => {
        const { stockSymbol, transactionType, quantity, pricePerShare, totalAmount } = transaction;

        if (!summary[stockSymbol]) {
            summary[stockSymbol] = {
                symbol: stockSymbol,
                name: transaction.stockName,
                totalQuantity: 0,
                totalInvested: 0,
                averagePurchasePrice: 0,
                transactions: []
            };
        }

        const holding = summary[stockSymbol];
        holding.transactions.push(transaction);

        if (transactionType === 'BUY') {
            holding.totalQuantity += quantity;
            holding.totalInvested += totalAmount;
        } else if (transactionType === 'SELL') {
            holding.totalQuantity -= quantity;
            // Reduce invested amount proportionally
            const sellRatio = quantity / (holding.totalQuantity + quantity);
            holding.totalInvested *= (1 - sellRatio);
        }

        // Recalculate average purchase price
        if (holding.totalQuantity > 0) {
            holding.averagePurchasePrice = holding.totalInvested / holding.totalQuantity;
        }
    });

    // Filter out holdings with zero quantity and calculate totals
    const activeHoldings = Object.values(summary).filter(holding => holding.totalQuantity > 0);

    activeHoldings.forEach(holding => {
        totalInvested += holding.totalInvested;
        // Note: totalCurrentValue would need current market prices
    });

    return {
        holdings: activeHoldings,
        summary: {
            totalInvested,
            totalCurrentValue, // This would be calculated with current prices
            totalStocks: activeHoldings.length
        }
    };
};

module.exports = StockTransaction;
