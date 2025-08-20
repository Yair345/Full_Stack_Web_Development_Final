const {
    StockTransaction,
    Portfolio,
    Watchlist,
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

// Popular stock symbols for demo
const popularStocks = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL', 'UBER', 'SPOT'
];

/**
 * Get available stocks for trading
 */
const getAvailableStocks = async (req, res) => {
    try {
        const { search, sector, limit = 50, offset = 0 } = req.query;

        // Use real stock API to get current data
        let stocks = [];

        if (search) {
            // If searching, use the search API
            try {
                const searchResults = await stockService.searchStocks(search, parseInt(limit));
                stocks = searchResults.map(stock => ({
                    symbol: stock.symbol,
                    name: stock.name,
                    type: stock.type,
                    region: stock.region,
                    currency: stock.currency,
                    price: 0, // Will be populated by subsequent quote calls
                    change: 0,
                    changePercent: 0,
                    volume: 0,
                    sector: 'Unknown'
                }));
            } catch (error) {
                console.warn('Search API failed, falling back to filtered popular stocks');
                const searchTerm = search.toLowerCase();
                const filteredSymbols = popularStocks.filter(symbol =>
                    symbol.toLowerCase().includes(searchTerm)
                );

                // Get quotes for filtered symbols
                const batchResult = await stockService.getBatchQuotes(filteredSymbols.slice(0, parseInt(limit)));
                stocks = batchResult.results || [];
            }
        } else {
            // Get popular stocks with real-time data
            try {
                const batchResult = await stockService.getBatchQuotes(popularStocks.slice(0, parseInt(limit)));
                stocks = batchResult.results || [];
            } catch (error) {
                console.error('Failed to fetch stock data:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch stock data from external API',
                    error: error.message
                });
            }
        }

        // Apply sector filter if specified
        if (sector && stocks.length > 0) {
            stocks = stocks.filter(stock =>
                stock.sector && stock.sector.toLowerCase() === sector.toLowerCase()
            );
        }

        // Apply pagination
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedStocks = stocks.slice(startIndex, endIndex);

        console.log(`Fetched ${paginatedStocks.length} stocks from external API`);

        // Return stocks array directly for easier client handling
        res.json({
            success: true,
            data: paginatedStocks || [],
            total: stocks.length,
            limit: parseInt(limit),
            offset: parseInt(offset),
            source: 'EXTERNAL_API'
        });
    } catch (error) {
        console.error('Error fetching available stocks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available stocks from external API',
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

        // Validate stock symbol and price
        if (!stockSymbol || !pricePerShare || pricePerShare <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid stock symbol and price are required'
            });
        }

        // For demo purposes, accept the price from client
        // In production, you would validate against real-time market data
        const stockInfo = {
            symbol: stockSymbol.toUpperCase(),
            price: parseFloat(pricePerShare),
            name: stockSymbol.toUpperCase() + ' Corporation'
        };

        console.log('Using stock data:', stockInfo);

        // Validate price against current market price (allow 5% tolerance)
        const currentMarketPrice = stockInfo.price;
        const priceDeviation = Math.abs(pricePerShare - currentMarketPrice) / currentMarketPrice;

        if (priceDeviation > 0.05) { // 5% tolerance
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Price has changed. Current market price: $${currentMarketPrice.toFixed(2)}`,
                data: {
                    requestedPrice: pricePerShare,
                    currentPrice: currentMarketPrice,
                    symbol: stockSymbol.toUpperCase()
                }
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

        // For demo purposes, accept the price from client
        // In production, you would validate against real-time market data
        const stockInfo = {
            symbol: stockSymbol.toUpperCase(),
            price: parseFloat(pricePerShare),
            name: stockSymbol.toUpperCase() + ' Corporation'
        };

        console.log('Using stock data for sale:', stockInfo);

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
        const { updatePrices = true } = req.query;

        let portfolioSummary = await Portfolio.getPortfolioSummary(userId);

        // Update current prices if requested and portfolio has holdings
        if (updatePrices === 'true' && portfolioSummary.holdings.length > 0) {
            try {
                console.log('Updating portfolio prices...');
                const symbols = portfolioSummary.holdings.map(holding => holding.stock_symbol || holding.stockSymbol);
                
                // Get current prices from external API
                const batchResult = await stockService.getBatchQuotes(symbols);
                
                if (batchResult.results.length > 0) {
                    // Update portfolio with current prices and daily change data
                    const priceUpdates = batchResult.results.map(stock => ({
                        symbol: stock.symbol,
                        price: stock.price,
                        change: stock.change || 0,
                        changePercent: stock.changePercent || 0,
                        previousClose: stock.previousClose || stock.price
                    }));
                    
                    await Portfolio.updatePrices(priceUpdates);
                    
                    // Fetch updated portfolio data
                    portfolioSummary = await Portfolio.getPortfolioSummary(userId);
                    console.log(`Updated prices for ${priceUpdates.length} portfolio holdings`);
                }
            } catch (priceUpdateError) {
                console.warn('Failed to update portfolio prices:', priceUpdateError.message);
                // Continue with existing data if price update fails
            }
        }

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
        const { limit = 50, offset = 0, includeInactive = false, updatePrices = true } = req.query;

        let result = await Watchlist.getUserWatchlist(userId, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            includeInactive: includeInactive === 'true'
        });

        // Update current prices if requested and watchlist has items
        if (updatePrices === 'true' && result.rows.length > 0) {
            try {
                console.log('Updating watchlist prices...');
                const symbols = result.rows.map(item => item.stock_symbol || item.stockSymbol);
                
                // Get current prices from external API
                const batchResult = await stockService.getBatchQuotes(symbols);
                
                if (batchResult.results.length > 0) {
                    // Update watchlist with current prices and daily change data
                    const priceUpdates = batchResult.results.map(stock => ({
                        symbol: stock.symbol,
                        price: stock.price,
                        change: stock.change || 0,
                        changePercent: stock.changePercent || 0,
                        previousClose: stock.previousClose || stock.price
                    }));
                    
                    await Watchlist.updatePrices(priceUpdates);
                    
                    // Fetch updated watchlist data
                    result = await Watchlist.getUserWatchlist(userId, {
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        includeInactive: includeInactive === 'true'
                    });
                    console.log(`Updated prices for ${priceUpdates.length} watchlist items`);
                }
            } catch (priceUpdateError) {
                console.warn('Failed to update watchlist prices:', priceUpdateError.message);
                // Continue with existing data if price update fails
            }
        }

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

        // For demo purposes, create basic stock info
        // In production, you would fetch from real market data
        const stockInfo = {
            symbol: stockSymbol.toUpperCase(),
            name: stockSymbol.toUpperCase() + ' Corporation',
            price: 100 + Math.random() * 200 // Random price between 100-300
        };

        console.log('Using stock data for watchlist:', stockInfo);

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

        console.log(`Searching stocks for query: "${query}"`);

        // Use external API for stock search
        let results = [];
        try {
            results = await stockService.searchStocks(query, 20);
            console.log(`Found ${results.length} stocks matching "${query}"`);
        } catch (error) {
            console.warn('Stock search API failed, falling back to popular stocks filter:', error);

            // Fallback: filter popular stocks by query
            const searchTerm = query.toLowerCase();
            const filteredSymbols = popularStocks.filter(symbol =>
                symbol.toLowerCase().includes(searchTerm)
            );

            if (filteredSymbols.length > 0) {
                const batchResult = await stockService.getBatchQuotes(filteredSymbols.slice(0, 10));
                results = batchResult.results.map(stock => ({
                    symbol: stock.symbol,
                    name: stock.name,
                    type: 'Common Stock',
                    region: 'US',
                    currency: 'USD',
                    matchScore: 1.0
                }));
            }
        }

        res.json({
            success: true,
            data: {
                results,
                query,
                total: results.length,
                source: 'EXTERNAL_API'
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

/**
 * Update prices for user's portfolio and watchlist
 */
const updatePortfolioAndWatchlistPrices = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('=== Updating Portfolio and Watchlist Prices ===');
        
        // Get all unique symbols from user's portfolio and watchlist
        const [portfolioSummary, watchlistResult] = await Promise.all([
            Portfolio.getPortfolioSummary(userId),
            Watchlist.getUserWatchlist(userId)
        ]);
        
        const portfolioSymbols = portfolioSummary.holdings.map(holding => 
            holding.stock_symbol || holding.stockSymbol
        );
        const watchlistSymbols = watchlistResult.rows.map(item => 
            item.stock_symbol || item.stockSymbol
        );
        
        // Get unique symbols
        const allSymbols = [...new Set([...portfolioSymbols, ...watchlistSymbols])];
        
        if (allSymbols.length === 0) {
            return res.json({
                success: true,
                message: 'No symbols to update',
                data: {
                    portfolioUpdated: 0,
                    watchlistUpdated: 0,
                    totalSymbols: 0
                }
            });
        }
        
        console.log(`Fetching prices for ${allSymbols.length} symbols:`, allSymbols);
        
        // Get current prices from external API
        const batchResult = await stockService.getBatchQuotes(allSymbols);
        
        if (batchResult.results.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch any current prices',
                errors: batchResult.errors
            });
        }
        
        const priceUpdates = batchResult.results.map(stock => ({
            symbol: stock.symbol,
            price: stock.price
        }));
        
        console.log(`Successfully fetched ${priceUpdates.length} prices`);
        
        // Update both portfolio and watchlist prices
        const [portfolioUpdateResult, watchlistUpdateResult] = await Promise.all([
            portfolioSymbols.length > 0 ? Portfolio.updatePrices(priceUpdates) : [],
            watchlistSymbols.length > 0 ? Watchlist.updatePrices(priceUpdates) : []
        ]);
        
        const portfolioUpdatedCount = portfolioUpdateResult.reduce((sum, result) => sum + result.updatedCount, 0);
        const watchlistUpdatedCount = watchlistUpdateResult.reduce((sum, result) => sum + result.updatedCount, 0);
        
        console.log(`Price update completed: Portfolio: ${portfolioUpdatedCount}, Watchlist: ${watchlistUpdatedCount}`);
        
        res.json({
            success: true,
            message: 'Prices updated successfully',
            data: {
                portfolioUpdated: portfolioUpdatedCount,
                watchlistUpdated: watchlistUpdatedCount,
                totalSymbols: allSymbols.length,
                successfulFetches: priceUpdates.length,
                errors: batchResult.errors.length > 0 ? batchResult.errors : undefined
            }
        });
    } catch (error) {
        console.error('Error updating prices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update prices',
            error: error.message
        });
    }
};

module.exports = {
    getAvailableStocks,
    buyStock,
    sellStock,
    getStockTransactions,
    getPortfolio,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    searchStocks,
    updatePortfolioAndWatchlistPrices
};
