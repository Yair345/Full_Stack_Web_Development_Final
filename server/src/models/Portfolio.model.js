const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Portfolio = sequelize.define('Portfolio', {
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
    totalQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_quantity',
        validate: {
            min: 0
        }
    },
    averagePurchasePrice: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        field: 'average_purchase_price',
        validate: {
            min: 0
        }
    },
    totalInvested: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        field: 'total_invested',
        validate: {
            min: 0
        }
    },
    currentPrice: {
        type: DataTypes.DECIMAL(15, 4),
        defaultValue: 0,
        field: 'current_price'
    },
    currentValue: {
        type: DataTypes.DECIMAL(15, 4),
        defaultValue: 0,
        field: 'current_value'
    },
    unrealizedGainLoss: {
        type: DataTypes.DECIMAL(15, 4),
        defaultValue: 0,
        field: 'unrealized_gain_loss'
    },
    unrealizedGainLossPercent: {
        type: DataTypes.DECIMAL(8, 4),
        defaultValue: 0,
        field: 'unrealized_gain_loss_percent'
    },
    dailyChange: {
        type: DataTypes.DECIMAL(15, 4),
        defaultValue: 0,
        field: 'daily_change'
    },
    dailyChangePercent: {
        type: DataTypes.DECIMAL(8, 4),
        defaultValue: 0,
        field: 'daily_change_percent'
    },
    previousClose: {
        type: DataTypes.DECIMAL(15, 4),
        defaultValue: 0,
        field: 'previous_close'
    },
    lastPriceUpdate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'last_price_update'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'portfolios',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'stock_symbol']
        },
        {
            fields: ['user_id', 'is_active']
        },
        {
            fields: ['stock_symbol']
        }
    ],
    hooks: {
        beforeValidate: (portfolio) => {
            // Ensure stock symbol is uppercase
            if (portfolio.stockSymbol) {
                portfolio.stockSymbol = portfolio.stockSymbol.toUpperCase();
            }
        },
        beforeSave: (portfolio) => {
            // Calculate current values when price or quantity changes
            if (portfolio.changed('currentPrice') || portfolio.changed('totalQuantity')) {
                portfolio.currentValue = parseFloat(portfolio.totalQuantity) * parseFloat(portfolio.currentPrice || 0);
                portfolio.unrealizedGainLoss = parseFloat(portfolio.currentValue) - parseFloat(portfolio.totalInvested);

                if (parseFloat(portfolio.totalInvested) > 0) {
                    portfolio.unrealizedGainLossPercent = (parseFloat(portfolio.unrealizedGainLoss) / parseFloat(portfolio.totalInvested)) * 100;
                } else {
                    portfolio.unrealizedGainLossPercent = 0;
                }
            }

            // Calculate daily price changes when current price changes
            if (portfolio.changed('currentPrice') && parseFloat(portfolio.previousClose || portfolio.currentPrice) > 0) {
                const currentPrice = parseFloat(portfolio.currentPrice);
                const previousClose = parseFloat(portfolio.previousClose || portfolio.currentPrice);
                
                portfolio.dailyChange = currentPrice - previousClose;
                portfolio.dailyChangePercent = (portfolio.dailyChange / previousClose) * 100;
            }

            // Set to inactive if quantity is 0
            if (portfolio.totalQuantity === 0) {
                portfolio.isActive = false;
            }

            // Update last price update timestamp if current price changed
            if (portfolio.changed('currentPrice')) {
                portfolio.lastPriceUpdate = new Date();
            }
        }
    }
});

// Instance methods
Portfolio.prototype.updateAfterBuy = function (quantity, pricePerShare, totalAmount) {
    const newTotalInvested = parseFloat(this.totalInvested) + parseFloat(totalAmount);
    const newTotalQuantity = parseInt(this.totalQuantity) + parseInt(quantity);

    this.totalInvested = newTotalInvested;
    this.totalQuantity = newTotalQuantity;
    this.averagePurchasePrice = newTotalInvested / newTotalQuantity;
    this.isActive = true;

    return this.save();
};

Portfolio.prototype.updateAfterSell = function (quantity) {
    if (parseInt(quantity) > parseInt(this.totalQuantity)) {
        throw new Error('Cannot sell more shares than owned');
    }

    const soldRatio = parseInt(quantity) / parseInt(this.totalQuantity);
    this.totalQuantity -= parseInt(quantity);
    this.totalInvested *= (1 - soldRatio);

    if (this.totalQuantity > 0) {
        this.averagePurchasePrice = parseFloat(this.totalInvested) / parseInt(this.totalQuantity);
    } else {
        this.isActive = false;
    }

    return this.save();
};

// Class methods
Portfolio.updateAfterTransaction = async function (transaction) {
    const { userId, stockSymbol, stockName, transactionType, quantity, pricePerShare, totalAmount } = transaction;

    let portfolio = await this.findOne({
        where: { userId, stockSymbol }
    });

    if (!portfolio && transactionType === 'BUY') {
        // Create new portfolio entry for first purchase
        portfolio = await this.create({
            userId,
            stockSymbol,
            stockName,
            totalQuantity: quantity,
            averagePurchasePrice: pricePerShare,
            totalInvested: totalAmount,
            currentPrice: pricePerShare,
            isActive: true
        });
    } else if (portfolio) {
        if (transactionType === 'BUY') {
            await portfolio.updateAfterBuy(quantity, pricePerShare, totalAmount);
        } else if (transactionType === 'SELL') {
            await portfolio.updateAfterSell(quantity);
        }
    } else {
        throw new Error(`Cannot ${transactionType} - no portfolio found`);
    }

    return portfolio;
};

Portfolio.getPortfolioSummary = async function (userId) {
    const holdings = await this.findAll({
        where: {
            userId,
            isActive: true,
            totalQuantity: {
                [sequelize.Sequelize.Op.gt]: 0
            }
        },
        order: [['stockSymbol', 'ASC']]
    });

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalUnrealizedGainLoss = 0;

    holdings.forEach(holding => {
        totalInvested += parseFloat(holding.totalInvested);
        totalCurrentValue += parseFloat(holding.currentValue);
        totalUnrealizedGainLoss += parseFloat(holding.unrealizedGainLoss);
    });

    const totalUnrealizedGainLossPercent = totalInvested > 0
        ? (totalUnrealizedGainLoss / totalInvested) * 100
        : 0;

    return {
        holdings: holdings.map(holding => holding.toJSON()),
        summary: {
            totalHoldings: holdings.length,
            totalInvested,
            totalCurrentValue,
            totalUnrealizedGainLoss,
            totalUnrealizedGainLossPercent
        }
    };
};

Portfolio.updatePrices = async function (priceUpdates) {
    const results = [];

    for (const update of priceUpdates) {
        const { symbol, price, change, changePercent, previousClose } = update;

        const updateData = {
            currentPrice: price,
            dailyChange: change || 0,
            dailyChangePercent: changePercent || 0,
            previousClose: previousClose || price
        };

        const updated = await this.update(
            updateData,
            {
                where: {
                    stockSymbol: symbol.toUpperCase(),
                    isActive: true
                },
                returning: true
            }
        );

        results.push({
            symbol,
            updatedCount: updated[0]
        });
    }

    return results;
};

module.exports = Portfolio;
