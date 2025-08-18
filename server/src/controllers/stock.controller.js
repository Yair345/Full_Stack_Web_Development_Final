const {
    StockTransaction,
    Portfolio,
    Watchlist,
    StockQuote,
    Account,
    Transaction,
    sequelize
} = require('../models');
const stockService = require('../services/stock.service');
const auditService = require('../services/audit.service');
const { ACCOUNT_TYPES, TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../utils/constants');
const { generateTransactionRef } = require('../utils/encryption.utils');
const { Op } = require('sequelize');
const AuditService = require('../services/audit.service');

// Mock stock data for development (will be replaced by external API calls)
const mockStockData = [
    {
        symbol: "AAPL",
        name: "Apple Inc.",
        sector: "Technology",
        price: 178.25,
        change: 2.15,
        changePercent: 1.22,
        dayHigh: 180.45,
        dayLow: 176.80,
        volume: 45678900,
        marketCap: "2800000000000"
    },
    {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        sector: "Technology",
        price: 342.60,
        change: -1.85,
        changePercent: -0.54,
        dayHigh: 345.20,
        dayLow: 340.15,
        volume: 28945600,
        marketCap: "2500000000000"
    },
    {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        sector: "Technology",
        price: 125.80,
        change: 3.45,
        changePercent: 2.82,
        dayHigh: 127.90,
        dayLow: 122.35,
        volume: 34567800,
        marketCap: "1600000000000"
    },
    {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        sector: "Consumer Discretionary",
        price: 145.30,
        change: -0.95,
        changePercent: -0.65,
        dayHigh: 147.50,
        dayLow: 143.80,
        volume: 41234500,
        marketCap: "1500000000000"
    },
    {
        symbol: "TSLA",
        name: "Tesla Inc.",
        sector: "Automotive",
        price: 238.45,
        change: 12.30,
        changePercent: 5.44,
        dayHigh: 242.80,
        dayLow: 225.60,
        volume: 87654300,
        marketCap: "758000000000"
    },
    {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        sector: "Technology",
        price: 875.20,
        change: 15.60,
        changePercent: 1.81,
        dayHigh: 888.90,
        dayLow: 865.40,
        volume: 52341700,
        marketCap: "2100000000000"
    }
];

/**
 * Get available stocks for trading
 */
const getAvailableStocks = async (req, res) => {
    try {
        const { search, sector, limit = 50, offset = 0 } = req.query;

        // In production, this would fetch from external API
        let stocks = [...mockStockData];

        // Apply filters
        if (search) {
            const searchTerm = search.toLowerCase();
            stocks = stocks.filter(stock =>
                stock.symbol.toLowerCase().includes(searchTerm) ||
                stock.name.toLowerCase().includes(searchTerm)
            );
        }

        if (sector) {
            stocks = stocks.filter(stock =>
                stock.sector.toLowerCase() === sector.toLowerCase()
            );
        }

        // Apply pagination
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedStocks = stocks.slice(startIndex, endIndex);

        // Return stocks array directly for easier client handling
        res.json({
            success: true,
            data: paginatedStocks || [], // Return stocks array directly
            total: stocks.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Error fetching available stocks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available stocks',
            error: error.message
        });
    }
};

/**
 * Get stock quote by symbol
 */
const getStockQuote = async (req, res) => {
    try {
        const { symbol } = req.params;

        // In production, this would fetch from external API
        const stock = mockStockData.find(s =>
            s.symbol.toUpperCase() === symbol.toUpperCase()
        );

        if (!stock) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
        }

        res.json({
            success: true,
            data: stock
        });
    } catch (error) {
        console.error('Error fetching stock quote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock quote',
            error: error.message
        });
    }
};

/**
 * Buy stocks
 */
const buyStock = async (req, res) => {
    const dbTransaction = await sequelize.transaction();

    try {
        const { stockSymbol, quantity, pricePerShare } = req.body;
        const userId = req.user.id;

        console.log('=== BuyStock Debug Info ===');
        console.log('User ID:', userId);
        console.log('Request Body:', { stockSymbol, quantity, pricePerShare });

        // Validate input
        if (!stockSymbol || !quantity || !pricePerShare) {
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Stock symbol, quantity, and price per share are required'
            });
        }

        if (quantity <= 0 || pricePerShare <= 0) {
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Quantity and price must be positive numbers'
            });
        }

        // Get stock info (in production, verify current price from API)
        const stockInfo = mockStockData.find(s =>
            s.symbol.toUpperCase() === stockSymbol.toUpperCase()
        );

        if (!stockInfo) {
            await dbTransaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
        }

        const totalAmount = quantity * pricePerShare;
        const fees = 2.99; // Fixed trading fee
        const totalCost = totalAmount + fees;

        console.log('Cost calculation:', { totalAmount, fees, totalCost });

        // Check user's checking account balance
        const checkingAccount = await Account.findOne({
            where: {
                user_id: userId,
                account_type: ACCOUNT_TYPES.CHECKING,
                is_active: true
            },
            transaction: dbTransaction
        });

        if (!checkingAccount) {
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'No active checking account found'
            });
        }

        console.log('Account balance check:', {
            currentBalance: checkingAccount.balance,
            availableBalance: checkingAccount.getAvailableBalance(),
            requiredAmount: totalCost,
            hasSufficientFunds: checkingAccount.hasSufficientBalance(totalCost)
        });

        // Check if user has sufficient balance
        if (!checkingAccount.hasSufficientBalance(totalCost)) {
            const availableBalance = checkingAccount.getAvailableBalance();
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Insufficient funds. Available balance: $${availableBalance.toFixed(2)}, Required: $${totalCost.toFixed(2)}`,
                data: {
                    availableBalance: availableBalance,
                    requiredAmount: totalCost,
                    shortfall: totalCost - availableBalance
                }
            });
        }

        // Create bank account transaction for the stock purchase
        const bankTransaction = await Transaction.create({
            transaction_ref: generateTransactionRef(),
            from_account_id: checkingAccount.id,
            to_account_id: null, // Stock purchase - money goes out of the system
            transaction_type: TRANSACTION_TYPES.PAYMENT,
            amount: totalCost,
            currency: 'USD',
            status: TRANSACTION_STATUS.COMPLETED,
            description: `Stock purchase: ${quantity} shares of ${stockSymbol.toUpperCase()} at $${pricePerShare}`,
            metadata: {
                stockSymbol: stockSymbol.toUpperCase(),
                quantity: parseInt(quantity),
                pricePerShare: parseFloat(pricePerShare),
                stockName: stockInfo.name,
                fees: fees,
                transactionType: 'STOCK_PURCHASE'
            },
            external_reference: `STOCK_${stockSymbol.toUpperCase()}_${Date.now()}`,
            initiated_by: userId,
            completed_at: new Date()
        }, { transaction: dbTransaction });

        // Update account balance
        await checkingAccount.update({
            balance: checkingAccount.balance - totalCost
        }, { transaction: dbTransaction });

        console.log('Bank transaction created:', {
            id: bankTransaction.id,
            transaction_ref: bankTransaction.transaction_ref,
            amount: bankTransaction.amount,
            newAccountBalance: checkingAccount.balance - totalCost
        });

        // Create stock transaction
        const stockTransaction = await StockTransaction.create({
            userId,
            transactionType: 'BUY',
            stockSymbol: stockSymbol.toUpperCase(),
            stockName: stockInfo.name,
            quantity: parseInt(quantity),
            pricePerShare: parseFloat(pricePerShare),
            totalAmount: totalAmount + fees,
            fees,
            status: 'COMPLETED',
            executedAt: new Date(),
            marketPrice: stockInfo.price,
            orderType: 'MARKET'
        }, { transaction: dbTransaction });

        // Update portfolio
        const portfolio = await Portfolio.updateAfterTransaction(stockTransaction, { transaction: dbTransaction });

        // Ensure the portfolio has the correct current price
        if (portfolio) {
            await portfolio.update({
                currentPrice: stockInfo.price
            }, { transaction: dbTransaction });
        }

        // Create audit log
        await auditService.logTransaction({
            action: 'stock_buy',
            req,
            transaction: {
                id: stockTransaction.id,
                transaction_ref: bankTransaction.transaction_ref,
                amount: totalAmount + fees,
                currency: 'USD',
                type: 'STOCK_BUY',
                status: 'COMPLETED'
            },
            details: {
                stockSymbol: stockSymbol.toUpperCase(),
                quantity,
                pricePerShare,
                totalAmount: totalAmount + fees,
                fees,
                bankTransactionId: bankTransaction.id,
                accountBalanceAfter: checkingAccount.balance - totalCost
            }
        });

        // Commit the transaction
        await dbTransaction.commit();

        console.log('Stock purchase successful:', {
            stockTransactionId: stockTransaction.id,
            bankTransactionId: bankTransaction.id,
            portfolioUpdated: !!portfolio
        });

        res.status(201).json({
            success: true,
            message: 'Stock purchased successfully',
            data: {
                transaction: stockTransaction.toJSON(),
                portfolio: portfolio ? portfolio.toJSON() : null,
                bankTransaction: {
                    id: bankTransaction.id,
                    transaction_ref: bankTransaction.transaction_ref,
                    amount: bankTransaction.amount,
                    accountBalanceAfter: checkingAccount.balance - totalCost
                }
            }
        });
    } catch (error) {
        console.error('Error buying stock:', error);
        await dbTransaction.rollback();
        res.status(500).json({
            success: false,
            message: 'Failed to buy stock',
            error: error.message
        });
    }
};

/**
 * Sell stocks
 */
const sellStock = async (req, res) => {
    const dbTransaction = await sequelize.transaction();

    try {
        const { stockSymbol, quantity, pricePerShare } = req.body;
        const userId = req.user.id;

        console.log('=== SellStock Debug Info ===');
        console.log('User ID:', userId);
        console.log('Request Body:', { stockSymbol, quantity, pricePerShare });

        // Validate input
        if (!stockSymbol || !quantity || !pricePerShare) {
            await dbTransaction.rollback();
            console.log('Validation failed:', { stockSymbol, quantity, pricePerShare });
            return res.status(400).json({
                success: false,
                message: 'Stock symbol, quantity, and price per share are required'
            });
        }

        if (quantity <= 0 || pricePerShare <= 0) {
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Quantity and price must be positive numbers'
            });
        }

        // Check portfolio holding
        const holding = await Portfolio.findOne({
            where: {
                userId,
                stockSymbol: stockSymbol.toUpperCase(),
                isActive: true
            },
            transaction: dbTransaction
        });

        if (!holding || holding.totalQuantity < quantity) {
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Insufficient shares to sell'
            });
        }

        // Get stock info
        const stockInfo = mockStockData.find(s =>
            s.symbol.toUpperCase() === stockSymbol.toUpperCase()
        );

        const totalAmount = quantity * pricePerShare;
        const fees = 2.99; // Fixed trading fee
        const netAmount = totalAmount - fees; // Amount credited after fees

        console.log('Sale calculation:', { totalAmount, fees, netAmount });

        // Get user's checking account
        const checkingAccount = await Account.findOne({
            where: {
                user_id: userId,
                account_type: ACCOUNT_TYPES.CHECKING,
                is_active: true
            },
            transaction: dbTransaction
        });

        if (!checkingAccount) {
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'No active checking account found'
            });
        }

        console.log('Account balance before sale:', {
            currentBalance: checkingAccount.balance,
            saleAmount: netAmount
        });

        // Create bank account transaction for the stock sale (credit to account)
        const bankTransaction = await Transaction.create({
            transaction_ref: generateTransactionRef(),
            from_account_id: null, // Stock sale - money comes into the system
            to_account_id: checkingAccount.id,
            transaction_type: TRANSACTION_TYPES.DEPOSIT,
            amount: netAmount,
            currency: 'USD',
            status: TRANSACTION_STATUS.COMPLETED,
            description: `Stock sale: ${quantity} shares of ${stockSymbol.toUpperCase()} at $${pricePerShare}`,
            metadata: {
                stockSymbol: stockSymbol.toUpperCase(),
                quantity: parseInt(quantity),
                pricePerShare: parseFloat(pricePerShare),
                stockName: holding.stockName,
                fees: fees,
                grossAmount: totalAmount,
                transactionType: 'STOCK_SALE'
            },
            external_reference: `STOCK_SALE_${stockSymbol.toUpperCase()}_${Date.now()}`,
            initiated_by: userId,
            completed_at: new Date()
        }, { transaction: dbTransaction });

        // Update account balance (credit the net amount)
        await checkingAccount.update({
            balance: checkingAccount.balance + netAmount
        }, { transaction: dbTransaction });

        console.log('Bank transaction created:', {
            id: bankTransaction.id,
            transaction_ref: bankTransaction.transaction_ref,
            amount: bankTransaction.amount,
            newAccountBalance: checkingAccount.balance + netAmount
        });

        // Create stock transaction
        const stockTransaction = await StockTransaction.create({
            userId,
            transactionType: 'SELL',
            stockSymbol: stockSymbol.toUpperCase(),
            stockName: holding.stockName,
            quantity: parseInt(quantity),
            pricePerShare: parseFloat(pricePerShare),
            totalAmount: netAmount,
            fees,
            status: 'COMPLETED',
            executedAt: new Date(),
            marketPrice: stockInfo ? stockInfo.price : pricePerShare,
            orderType: 'MARKET'
        }, { transaction: dbTransaction });

        // Update portfolio
        const portfolio = await Portfolio.updateAfterTransaction(stockTransaction, { transaction: dbTransaction });

        // Create audit log
        await auditService.logTransaction({
            action: 'stock_sell',
            req,
            transaction: {
                id: stockTransaction.id,
                transaction_ref: bankTransaction.transaction_ref,
                amount: netAmount,
                currency: 'USD',
                type: 'STOCK_SELL',
                status: 'COMPLETED'
            },
            details: {
                stockSymbol: stockSymbol.toUpperCase(),
                quantity,
                pricePerShare,
                totalAmount: netAmount,
                grossAmount: totalAmount,
                fees,
                bankTransactionId: bankTransaction.id,
                accountBalanceAfter: checkingAccount.balance + netAmount
            }
        });

        // Commit the transaction
        await dbTransaction.commit();

        console.log('Stock sale successful:', {
            stockTransactionId: stockTransaction.id,
            bankTransactionId: bankTransaction.id,
            portfolioUpdated: !!portfolio
        });

        res.json({
            success: true,
            message: 'Stock sold successfully',
            data: {
                transaction: stockTransaction.toJSON(),
                portfolio: portfolio ? portfolio.toJSON() : null,
                bankTransaction: {
                    id: bankTransaction.id,
                    transaction_ref: bankTransaction.transaction_ref,
                    amount: bankTransaction.amount,
                    accountBalanceAfter: checkingAccount.balance + netAmount
                }
            }
        });
    } catch (error) {
        console.error('Error selling stock:', error);
        await dbTransaction.rollback();
        res.status(500).json({
            success: false,
            message: 'Failed to sell stock',
            error: error.message
        });
    }
};

/**
 * Get user's stock transactions
 */
const getStockTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            limit = 50,
            offset = 0,
            stockSymbol,
            transactionType,
            status,
            startDate,
            endDate
        } = req.query;

        const whereClause = { userId };

        if (stockSymbol) whereClause.stockSymbol = stockSymbol.toUpperCase();
        if (transactionType) whereClause.transactionType = transactionType;
        if (status) whereClause.status = status;

        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
            if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
        }

        const result = await StockTransaction.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                transactions: result.rows.map(t => t.toJSON()),
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Error fetching stock transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock transactions',
            error: error.message
        });
    }
};

/**
 * Get user's portfolio
 */
const getPortfolio = async (req, res) => {
    try {
        const userId = req.user.id;

        const portfolioSummary = await Portfolio.getPortfolioSummary(userId);

        // Return the holdings array directly for easier client handling
        res.json({
            success: true,
            data: portfolioSummary.holdings || [], // Return holdings array directly
            summary: portfolioSummary.summary || {
                totalHoldings: 0,
                totalInvested: 0,
                totalCurrentValue: 0,
                totalUnrealizedGainLoss: 0,
                totalUnrealizedGainLossPercent: 0
            }
        });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch portfolio',
            error: error.message
        });
    }
};

/**
 * Get user's watchlist
 */
const getWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0, includeInactive = false } = req.query;

        const result = await Watchlist.getUserWatchlist(userId, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            includeInactive: includeInactive === 'true'
        });

        // Return the watchlist array directly for easier client handling
        res.json({
            success: true,
            data: result.rows.map(w => w.toJSON()) || [], // Return watchlist array directly
            total: result.count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch watchlist',
            error: error.message
        });
    }
};

/**
 * Add stock to watchlist
 */
const addToWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { stockSymbol, notes, priceAboveAlert, priceBelowAlert, alertsEnabled } = req.body;

        if (!stockSymbol) {
            return res.status(400).json({
                success: false,
                message: 'Stock symbol is required'
            });
        }

        // Get stock info
        const stockInfo = mockStockData.find(s =>
            s.symbol.toUpperCase() === stockSymbol.toUpperCase()
        );

        if (!stockInfo) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
        }

        const watchlistItem = await Watchlist.addToWatchlist(
            userId,
            stockSymbol,
            stockInfo.name,
            stockInfo.price, // This sets both addedPrice and currentPrice
            {
                notes,
                priceAboveAlert: priceAboveAlert ? parseFloat(priceAboveAlert) : null,
                priceBelowAlert: priceBelowAlert ? parseFloat(priceBelowAlert) : null,
                alertsEnabled: alertsEnabled || false
            }
        );

        // Update currentPrice to ensure it's set correctly
        await watchlistItem.update({
            currentPrice: stockInfo.price
        });

        res.status(201).json({
            success: true,
            message: 'Stock added to watchlist',
            data: watchlistItem.toJSON()
        });
    } catch (error) {
        console.error('Error adding to watchlist:', error);

        // Handle duplicate entry error gracefully
        if (error.message && error.message.includes('already in your watchlist')) {
            return res.status(400).json({
                success: false,
                message: 'Stock is already in your watchlist'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to add stock to watchlist',
            error: error.message
        });
    }
};

/**
 * Remove stock from watchlist
 */
const removeFromWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const watchlistItem = await Watchlist.findOne({
            where: { id, userId }
        });

        if (!watchlistItem) {
            return res.status(404).json({
                success: false,
                message: 'Watchlist item not found'
            });
        }

        // Soft delete by setting isActive to false
        await watchlistItem.update({ isActive: false });

        res.json({
            success: true,
            message: 'Stock removed from watchlist'
        });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove stock from watchlist',
            error: error.message
        });
    }
};

/**
 * Search stocks
 */
const searchStocks = async (req, res) => {
    try {
        const { q: query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // In production, this would use external API
        const searchTerm = query.toLowerCase();
        const results = mockStockData.filter(stock =>
            stock.symbol.toLowerCase().includes(searchTerm) ||
            stock.name.toLowerCase().includes(searchTerm)
        );

        res.json({
            success: true,
            data: {
                results,
                query,
                total: results.length
            }
        });
    } catch (error) {
        console.error('Error searching stocks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search stocks',
            error: error.message
        });
    }
};

module.exports = {
    getAvailableStocks,
    getStockQuote,
    buyStock,
    sellStock,
    getStockTransactions,
    getPortfolio,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    searchStocks
};
