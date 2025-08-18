const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Watchlist = sequelize.define('Watchlist', {
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
    addedPrice: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        field: 'added_price'
    },
    currentPrice: {
        type: DataTypes.DECIMAL(15, 4),
        defaultValue: 0,
        field: 'current_price'
    },
    priceChange: {
        type: DataTypes.DECIMAL(15, 4),
        defaultValue: 0,
        field: 'price_change'
    },
    priceChangePercent: {
        type: DataTypes.DECIMAL(8, 4),
        defaultValue: 0,
        field: 'price_change_percent'
    },
    priceAboveAlert: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: true,
        field: 'price_above_alert'
    },
    priceBelowAlert: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: true,
        field: 'price_below_alert'
    },
    alertsEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'alerts_enabled'
    },
    lastPriceUpdate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'last_price_update'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [0, 500]
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'watchlists',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'stock_symbol']
        },
        {
            fields: ['user_id', 'is_active', 'created_at']
        },
        {
            fields: ['stock_symbol']
        },
        {
            fields: ['alerts_enabled']
        }
    ],
    hooks: {
        beforeValidate: (watchlist) => {
            // Ensure stock symbol is uppercase
            if (watchlist.stockSymbol) {
                watchlist.stockSymbol = watchlist.stockSymbol.toUpperCase();
            }
        },
        beforeSave: (watchlist) => {
            // Calculate price changes when current price changes
            if (watchlist.changed('currentPrice') && parseFloat(watchlist.addedPrice) > 0) {
                watchlist.priceChange = parseFloat(watchlist.currentPrice) - parseFloat(watchlist.addedPrice);
                watchlist.priceChangePercent = (parseFloat(watchlist.priceChange) / parseFloat(watchlist.addedPrice)) * 100;
            }

            // Update last price update timestamp if current price changed
            if (watchlist.changed('currentPrice')) {
                watchlist.lastPriceUpdate = new Date();
            }
        }
    }
});

// Instance methods
Watchlist.prototype.checkAlerts = function () {
    const alerts = [];
    const currentPrice = parseFloat(this.currentPrice);

    if (this.alertsEnabled) {
        if (this.priceAboveAlert && currentPrice >= parseFloat(this.priceAboveAlert)) {
            alerts.push({
                type: 'PRICE_ABOVE',
                stockSymbol: this.stockSymbol,
                stockName: this.stockName,
                currentPrice,
                targetPrice: parseFloat(this.priceAboveAlert),
                message: `${this.stockSymbol} has reached your target price of $${this.priceAboveAlert}`
            });
        }

        if (this.priceBelowAlert && currentPrice <= parseFloat(this.priceBelowAlert)) {
            alerts.push({
                type: 'PRICE_BELOW',
                stockSymbol: this.stockSymbol,
                stockName: this.stockName,
                currentPrice,
                targetPrice: parseFloat(this.priceBelowAlert),
                message: `${this.stockSymbol} has dropped to your alert price of $${this.priceBelowAlert}`
            });
        }
    }

    return alerts;
};

// Class methods
Watchlist.checkAllAlerts = async function (userId = null) {
    const whereClause = {
        isActive: true,
        alertsEnabled: true
    };

    if (userId) {
        whereClause.userId = userId;
    }

    const watchlistItems = await this.findAll({
        where: whereClause
    });

    const allAlerts = [];

    for (const item of watchlistItems) {
        const alerts = item.checkAlerts();
        allAlerts.push(...alerts);
    }

    return allAlerts;
};

Watchlist.getUserWatchlist = async function (userId, options = {}) {
    const { includeInactive = false, limit = 50, offset = 0 } = options;

    const whereClause = { userId };
    if (!includeInactive) {
        whereClause.isActive = true;
    }

    return this.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
    });
};

Watchlist.addToWatchlist = async function (userId, stockSymbol, stockName, currentPrice, options = {}) {
    const { notes, priceAboveAlert, priceBelowAlert, alertsEnabled = false } = options;

    // Check if already exists
    const existing = await this.findOne({
        where: { userId, stockSymbol: stockSymbol.toUpperCase() }
    });

    if (existing) {
        if (existing.isActive) {
            throw new Error('Stock is already in your watchlist');
        } else {
            // Reactivate existing entry
            existing.isActive = true;
            existing.addedPrice = currentPrice;
            existing.currentPrice = currentPrice;
            existing.notes = notes || existing.notes;
            existing.priceAboveAlert = priceAboveAlert || existing.priceAboveAlert;
            existing.priceBelowAlert = priceBelowAlert || existing.priceBelowAlert;
            existing.alertsEnabled = alertsEnabled;
            return existing.save();
        }
    }

    return this.create({
        userId,
        stockSymbol: stockSymbol.toUpperCase(),
        stockName,
        addedPrice: currentPrice,
        currentPrice,
        notes,
        priceAboveAlert,
        priceBelowAlert,
        alertsEnabled
    });
};

Watchlist.updatePrices = async function (priceUpdates) {
    const results = [];

    for (const update of priceUpdates) {
        const { symbol, price } = update;

        const updated = await this.update(
            { currentPrice: price },
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

module.exports = Watchlist;
