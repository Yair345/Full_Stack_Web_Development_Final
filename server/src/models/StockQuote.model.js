const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockQuote = sequelize.define('StockQuote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    symbol: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        validate: {
            isUppercase: true,
            len: [1, 10]
        }
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    sector: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    industry: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    exchange: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'USD'
    },
    currentPrice: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        field: 'current_price'
    },
    openPrice: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: true,
        field: 'open_price'
    },
    highPrice: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: true,
        field: 'high_price'
    },
    lowPrice: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: true,
        field: 'low_price'
    },
    previousClose: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: true,
        field: 'previous_close'
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
    volume: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    averageVolume: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'average_volume'
    },
    marketCap: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'market_cap'
    },
    peRatio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'pe_ratio'
    },
    eps: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    dividend: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true
    },
    dividendYield: {
        type: DataTypes.DECIMAL(6, 4),
        allowNull: true,
        field: 'dividend_yield'
    },
    beta: {
        type: DataTypes.DECIMAL(6, 4),
        allowNull: true
    },
    week52High: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: true,
        field: 'week52_high'
    },
    week52Low: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: true,
        field: 'week52_low'
    },
    lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'last_updated'
    },
    source: {
        type: DataTypes.ENUM('ALPHA_VANTAGE', 'IEX_CLOUD', 'YAHOO_FINANCE', 'MANUAL'),
        defaultValue: 'MANUAL'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'stock_quotes',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['symbol']
        },
        {
            fields: ['last_updated']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['sector']
        },
        {
            fields: ['exchange']
        }
    ],
    hooks: {
        beforeValidate: (quote) => {
            // Ensure symbol is uppercase
            if (quote.symbol) {
                quote.symbol = quote.symbol.toUpperCase();
            }
        },
        beforeSave: (quote) => {
            // Calculate price changes when current price changes
            if (quote.changed('currentPrice') && quote.previousClose) {
                quote.priceChange = parseFloat(quote.currentPrice) - parseFloat(quote.previousClose);
                quote.priceChangePercent = (parseFloat(quote.priceChange) / parseFloat(quote.previousClose)) * 100;
            }

            // Update last updated timestamp
            quote.lastUpdated = new Date();
        }
    }
});

// Class methods
StockQuote.getOrCreateQuote = async function (symbol) {
    let quote = await this.findOne({
        where: { symbol: symbol.toUpperCase() }
    });

    if (!quote) {
        // Create a basic quote entry if it doesn't exist
        quote = await this.create({
            symbol: symbol.toUpperCase(),
            name: `${symbol.toUpperCase()} Inc.`,
            currentPrice: 0
        });
    }

    return quote;
};

StockQuote.updateFromAPI = async function (symbol, apiData, source = 'MANUAL') {
    const quote = await this.getOrCreateQuote(symbol);

    const updateData = {
        source,
        lastUpdated: new Date()
    };

    // Update basic info
    if (apiData.name) updateData.name = apiData.name;
    if (apiData.sector) updateData.sector = apiData.sector;
    if (apiData.industry) updateData.industry = apiData.industry;
    if (apiData.exchange) updateData.exchange = apiData.exchange;
    if (apiData.currency) updateData.currency = apiData.currency;

    // Update price data
    if (apiData.price !== undefined) {
        updateData.previousClose = quote.currentPrice || apiData.previousClose || apiData.price;
        updateData.currentPrice = apiData.price;
    }

    if (apiData.open !== undefined) updateData.openPrice = apiData.open;
    if (apiData.high !== undefined) updateData.highPrice = apiData.high;
    if (apiData.low !== undefined) updateData.lowPrice = apiData.low;

    // Update volume data
    if (apiData.volume !== undefined) updateData.volume = apiData.volume;
    if (apiData.averageVolume !== undefined) updateData.averageVolume = apiData.averageVolume;

    // Update market data
    if (apiData.marketCap !== undefined) updateData.marketCap = apiData.marketCap;
    if (apiData.peRatio !== undefined) updateData.peRatio = apiData.peRatio;
    if (apiData.eps !== undefined) updateData.eps = apiData.eps;
    if (apiData.dividend !== undefined) updateData.dividend = apiData.dividend;
    if (apiData.dividendYield !== undefined) updateData.dividendYield = apiData.dividendYield;
    if (apiData.beta !== undefined) updateData.beta = apiData.beta;
    if (apiData.week52High !== undefined) updateData.week52High = apiData.week52High;
    if (apiData.week52Low !== undefined) updateData.week52Low = apiData.week52Low;

    // Update the quote
    await quote.update(updateData);

    return quote;
};

StockQuote.bulkUpdateQuotes = async function (quotesData, source = 'MANUAL') {
    const results = [];

    for (const data of quotesData) {
        try {
            const quote = await this.updateFromAPI(data.symbol, data, source);
            results.push(quote.toJSON());
        } catch (error) {
            console.error(`Failed to update quote for ${data.symbol}:`, error);
            results.push({
                symbol: data.symbol,
                error: error.message
            });
        }
    }

    return results;
};

StockQuote.getActiveQuotes = async function (options = {}) {
    const { limit = 100, offset = 0, symbols, sector, exchange } = options;

    const whereClause = { isActive: true };

    if (symbols && symbols.length > 0) {
        whereClause.symbol = {
            [sequelize.Sequelize.Op.in]: symbols.map(s => s.toUpperCase())
        };
    }

    if (sector) whereClause.sector = sector;
    if (exchange) whereClause.exchange = exchange;

    return this.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['symbol', 'ASC']]
    });
};

StockQuote.searchStocks = async function (query, options = {}) {
    const { limit = 20, offset = 0 } = options;
    const searchQuery = `%${query.toUpperCase()}%`;

    return this.findAndCountAll({
        where: {
            isActive: true,
            [sequelize.Sequelize.Op.or]: [
                {
                    symbol: {
                        [sequelize.Sequelize.Op.like]: searchQuery
                    }
                },
                {
                    name: {
                        [sequelize.Sequelize.Op.like]: searchQuery
                    }
                }
            ]
        },
        limit,
        offset,
        order: [
            // Prioritize exact symbol matches
            [sequelize.Sequelize.literal(`CASE WHEN symbol LIKE '${query.toUpperCase()}%' THEN 0 ELSE 1 END`), 'ASC'],
            ['symbol', 'ASC']
        ]
    });
};

module.exports = StockQuote;
