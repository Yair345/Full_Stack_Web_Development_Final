import { stockAPI } from "./api";
import { mockStocksData } from "../pages/Stocks/stocksUtils";

/**
 * Stocks Service - Client-side wrapper for server stock API
 * This service only communicates with our server - no direct external API calls
 * All real-time data comes from the server which handles external APIs
 */
class StocksService {
    /**
     * Load available stocks from our server
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Object containing stocks data
     */
    async loadAvailableStocks(options = {}) {
        try {
            const response = await stockAPI.getAvailableStocks(options);
            return response;
        } catch (error) {
            console.error("Error loading available stocks:", error);

            // Fallback to mock data if server is unavailable
            return {
                success: false,
                error: error.message,
                data: mockStocksData.availableStocks || []
            };
        }
    }

    /**
     * Load all initial data needed for the stocks page
     * @returns {Promise<Object>} Object containing availableStocks, portfolio, and watchlist
     */
    async loadInitialData() {
        try {
            // Parallel loading from our server
            const [availableStocks, portfolio, watchlist] = await Promise.all([
                this.loadAvailableStocks(),
                stockAPI.getPortfolio().catch(() => ({ data: mockStocksData.portfolio || [] })),
                stockAPI.getWatchlist().catch(() => ({ data: mockStocksData.watchlist || [] }))
            ]);

            return {
                success: true,
                data: {
                    availableStocks: availableStocks.data || mockStocksData.availableStocks || [],
                    portfolio: portfolio.data || [],
                    watchlist: watchlist.data || []
                }
            };
        } catch (error) {
            console.error("Error loading initial data:", error);
            return {
                success: false,
                error: error.message,
                data: {
                    availableStocks: mockStocksData.availableStocks || [],
                    portfolio: mockStocksData.portfolio || [],
                    watchlist: mockStocksData.watchlist || []
                }
            };
        }
    }

    /**
     * Buy stocks through our server
     * @param {string} stockSymbol - Stock symbol to buy
     * @param {number} quantity - Number of shares to buy
     * @param {number} price - Price per share
     * @returns {Promise<Object>} Result of the buy operation
     */
    async buyStock(stockSymbol, quantity, price) {
        try {
            const orderData = {
                stockSymbol: stockSymbol.toUpperCase(),
                quantity: parseInt(quantity),
                pricePerShare: parseFloat(price),
            };

            console.log('🔄 Processing stock purchase...', orderData);

            const response = await stockAPI.buyStock(orderData);

            if (response.success) {
                // Reload portfolio to get updated holdings
                const portfolioResponse = await stockAPI.getPortfolio();

                // Extract bank transaction details for UI feedback
                const bankTransaction = response.data?.bankTransaction;
                const totalCost = (parseInt(quantity) * parseFloat(price)) + 2.99; // Including fees

                console.log('✅ Stock purchase successful!', {
                    stockSymbol,
                    quantity,
                    totalCost,
                    bankTransaction: bankTransaction
                });

                return {
                    success: true,
                    message: `Successfully bought ${quantity} shares of ${stockSymbol}!`,
                    details: {
                        symbol: stockSymbol.toUpperCase(),
                        quantity: parseInt(quantity),
                        pricePerShare: parseFloat(price),
                        totalCost: totalCost,
                        fees: 2.99,
                        accountBalanceAfter: bankTransaction?.accountBalanceAfter,
                        transactionRef: bankTransaction?.transaction_ref,
                        action: 'BUY'
                    },
                    portfolio: portfolioResponse.success ? portfolioResponse.data || [] : [],
                };
            } else {
                throw new Error(response.message || "Failed to buy stock");
            }
        } catch (error) {
            console.error('❌ Stock purchase failed:', error);
            return {
                success: false,
                message: `Failed to buy stock: ${error.message}`,
                details: {
                    symbol: stockSymbol?.toUpperCase(),
                    quantity: parseInt(quantity) || 0,
                    pricePerShare: parseFloat(price) || 0,
                    action: 'BUY'
                }
            };
        }
    }

    /**
     * Sell stocks through our server
     * @param {number} stockId - ID of the stock holding to sell
     * @param {number} quantity - Number of shares to sell
     * @param {Array} portfolio - Current portfolio to find stock details
     * @returns {Promise<Object>} Result of the sell operation
     */
    async sellStock(stockId, quantity, portfolio) {
        try {
            console.log("sellStock called with:", { stockId, quantity, portfolio: portfolio?.length });

            // Ensure portfolio is an array
            if (!Array.isArray(portfolio)) {
                throw new Error("Portfolio data not available");
            }

            // Find the stock in portfolio to get its symbol and current price
            const stock = portfolio.find((s) => s.id === stockId);
            if (!stock) {
                console.error("Stock not found. Available stocks:", portfolio.map(s => ({ id: s.id, symbol: s.symbol || s.stockSymbol })));
                throw new Error("Stock not found in portfolio");
            }

            console.log("Found stock:", stock);

            // Handle both transformed and raw database field names
            const stockSymbol = stock.symbol || stock.stockSymbol || stock.stock_symbol || '';
            const currentPrice = stock.currentPrice || stock.current_price || 0;

            console.log("Extracted data:", { stockSymbol, currentPrice });

            // Validate required fields
            if (!stockSymbol) {
                throw new Error("Stock symbol is missing from portfolio data");
            }

            if (!currentPrice || currentPrice <= 0) {
                throw new Error("Current price is missing or invalid");
            }

            const orderData = {
                stockSymbol: stockSymbol.toUpperCase(),
                quantity: parseInt(quantity),
                pricePerShare: parseFloat(currentPrice),
            };

            console.log("🔄 Processing stock sale...", orderData);

            const response = await stockAPI.sellStock(orderData);

            if (response.success) {
                // Reload portfolio to get updated holdings
                const portfolioResponse = await stockAPI.getPortfolio();

                // Extract bank transaction details for UI feedback
                const bankTransaction = response.data?.bankTransaction;
                const totalValue = parseInt(quantity) * parseFloat(currentPrice);
                const netAmount = totalValue - 2.99; // After fees

                console.log('✅ Stock sale successful!', {
                    stockSymbol,
                    quantity,
                    totalValue,
                    netAmount,
                    bankTransaction: bankTransaction
                });

                return {
                    success: true,
                    message: `Successfully sold ${quantity} shares of ${stockSymbol}!`,
                    details: {
                        symbol: stockSymbol.toUpperCase(),
                        quantity: parseInt(quantity),
                        pricePerShare: parseFloat(currentPrice),
                        totalValue: totalValue,
                        netAmount: netAmount,
                        fees: 2.99,
                        accountBalanceAfter: bankTransaction?.accountBalanceAfter,
                        transactionRef: bankTransaction?.transaction_ref,
                        action: 'SELL'
                    },
                    portfolio: portfolioResponse.success ? portfolioResponse.data || [] : [],
                };
            } else {
                throw new Error(response.message || "Failed to sell stock");
            }
        } catch (error) {
            console.error("❌ Stock sale failed:", error);
            return {
                success: false,
                message: `Failed to sell stock: ${error.message}`,
                details: {
                    symbol: '',
                    quantity: parseInt(quantity) || 0,
                    action: 'SELL'
                }
            };
        }
    }

    /**
     * Add stock to watchlist through our server
     * @param {string} stockSymbol - Stock symbol to add
     * @param {Array} availableStocks - Available stocks to find stock details
     * @returns {Promise<Object>} Result of the add operation
     */
    async addToWatchlist(stockSymbol, availableStocks) {
        try {
            // Ensure availableStocks is an array
            if (!Array.isArray(availableStocks)) {
                throw new Error("Stock data not available");
            }

            // Find stock data from available stocks
            const stock = availableStocks.find((s) => s.symbol === stockSymbol);
            if (!stock) {
                throw new Error("Stock not found");
            }

            console.log(`🔄 Adding ${stockSymbol} to watchlist...`);

            const watchlistData = {
                stockSymbol: stockSymbol.toUpperCase(),
                // Server will get the stock name and current price from external APIs
                alertsEnabled: false
            };

            const response = await stockAPI.addToWatchlist(watchlistData);

            if (response.success) {
                // Reload watchlist to get updated list
                const watchlistResponse = await stockAPI.getWatchlist();

                console.log(`✅ ${stockSymbol} successfully added to watchlist!`);

                return {
                    success: true,
                    message: `${stockSymbol} added to watchlist!`,
                    details: {
                        symbol: stockSymbol.toUpperCase(),
                        name: stock.name,
                        price: stock.price,
                        action: 'WATCH'
                    },
                    watchlist: watchlistResponse.success ? watchlistResponse.data || [] : [],
                };
            } else {
                throw new Error(
                    response.message || "Failed to add to watchlist"
                );
            }
        } catch (error) {
            console.error("❌ Failed to add to watchlist:", error);
            return {
                success: false,
                message: `Failed to add to watchlist: ${error.message}`,
                details: {
                    symbol: stockSymbol?.toUpperCase() || '',
                    action: 'WATCH'
                }
            };
        }
    }

    /**
     * Remove stock from watchlist through our server
     * @param {number} watchlistId - ID of the watchlist item to remove
     * @returns {Promise<Object>} Result of the remove operation
     */
    async removeFromWatchlist(watchlistId) {
        try {
            console.log(`Removing watchlist item ${watchlistId}`);

            const response = await stockAPI.removeFromWatchlist(watchlistId);

            if (response.success) {
                // Reload watchlist to get updated list
                const watchlistResponse = await stockAPI.getWatchlist();

                return {
                    success: true,
                    message: "Stock removed from watchlist!",
                    watchlist: watchlistResponse.success ? watchlistResponse.data || [] : [],
                };
            } else {
                throw new Error(
                    response.message || "Failed to remove from watchlist"
                );
            }
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            return {
                success: false,
                message: `Failed to remove from watchlist: ${error.message}`,
            };
        }
    }

    /**
     * Calculate portfolio statistics
     * @param {Array} portfolio - Current portfolio data
     * @returns {Object} Portfolio statistics
     */
    calculatePortfolioStats(portfolio) {
        // Ensure portfolio is an array
        if (!Array.isArray(portfolio) || portfolio.length === 0) {
            return {
                totalValue: 0,
                totalGain: 0,
                totalGainPercent: 0,
            };
        }

        const totalValue = portfolio.reduce((sum, stock) => {
            // Handle both snake_case and camelCase field names
            const quantity = stock.total_quantity || stock.totalQuantity || stock.quantity || 0;
            const currentPrice = stock.current_price || stock.currentPrice || 0;
            return sum + (parseInt(quantity) * parseFloat(currentPrice));
        }, 0);

        const totalInvested = portfolio.reduce((sum, stock) => {
            // Handle both snake_case and camelCase field names
            const quantity = stock.total_quantity || stock.totalQuantity || stock.quantity || 0;
            const avgPrice = stock.average_purchase_price || stock.averagePurchasePrice || 0;
            return sum + (parseInt(quantity) * parseFloat(avgPrice));
        }, 0);

        const totalGain = totalValue - totalInvested;
        const totalGainPercent =
            totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

        return {
            totalValue,
            totalGain,
            totalGainPercent,
        };
    }

    /**
     * Transform portfolio data for UI components
     * @param {Array} portfolio - Raw portfolio data from API
     * @returns {Array} Transformed portfolio data
     */
    transformPortfolioData(portfolio) {
        if (!Array.isArray(portfolio)) {
            return [];
        }

        return portfolio.map((stock) => {
            // Handle both snake_case (from DB) and camelCase field names
            const currentPrice = stock.current_price || stock.currentPrice || 0;
            const averagePurchasePrice = stock.average_purchase_price || stock.averagePurchasePrice || 0;
            const totalQuantity = stock.total_quantity || stock.totalQuantity || 0;
            const stockSymbol = stock.stock_symbol || stock.stockSymbol || '';
            const stockName = stock.stock_name || stock.stockName || '';

            return {
                id: stock.id,
                symbol: stockSymbol,
                name: stockName,
                quantity: totalQuantity,
                currentPrice: parseFloat(currentPrice),
                averagePurchasePrice: parseFloat(averagePurchasePrice),
                gain: (parseFloat(currentPrice) - parseFloat(averagePurchasePrice)) * parseInt(totalQuantity),
                gainPercent: averagePurchasePrice > 0
                    ? ((parseFloat(currentPrice) - parseFloat(averagePurchasePrice)) / parseFloat(averagePurchasePrice)) * 100
                    : 0,
            };
        });
    }

    /**
     * Transform watchlist data for UI components
     * @param {Array} watchlist - Raw watchlist data from API
     * @returns {Array} Transformed watchlist data
     */
    transformWatchlistData(watchlist) {
        if (!Array.isArray(watchlist)) {
            return [];
        }

        return watchlist.map((stock) => {
            // Handle both snake_case (from DB) and camelCase field names
            const currentPrice = stock.current_price || stock.currentPrice || 0;
            const priceChange = stock.price_change || stock.priceChange || 0;
            const priceChangePercent = stock.price_change_percent || stock.priceChangePercent || 0;
            const stockSymbol = stock.stock_symbol || stock.stockSymbol || '';
            const stockName = stock.stock_name || stock.stockName || '';
            const createdAt = stock.created_at || stock.createdAt || new Date();

            return {
                id: stock.id,
                symbol: stockSymbol,
                name: stockName,
                currentPrice: parseFloat(currentPrice),
                change: parseFloat(priceChange),
                changePercent: parseFloat(priceChangePercent),
                addedDate: createdAt,
            };
        });
    }
}

// Export a singleton instance
export const stocksService = new StocksService();
