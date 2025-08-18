import { stockAPI } from "./api";
import { mockStocksData } from "../pages/Stocks/stocksUtils";

/**
 * Stocks Service - Handles all stock-related API operations
 * This service encapsulates all API calls and data transformations for the stocks feature
 */
class StocksService {
    constructor() {
        // Alpha Vantage API configuration
        this.alphaVantageConfig = {
            baseUrl: "https://www.alphavantage.co/query",
            apiKey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "demo",
        };
    }

    /**
     * Fetch real stock data from Alpha Vantage API
     * @param {string} symbol - Stock symbol to fetch
     * @returns {Promise<Object>} Stock data from Alpha Vantage
     */
    async fetchRealStockData(symbol) {
        try {
            const response = await fetch(
                `${this.alphaVantageConfig.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageConfig.apiKey}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check for API errors
            if (data["Error Message"]) {
                throw new Error(data["Error Message"]);
            }

            if (data["Note"]) {
                throw new Error("API rate limit exceeded");
            }

            const quote = data["Global Quote"];
            if (!quote) {
                throw new Error("No quote data available");
            }

            // Transform Alpha Vantage data to our format
            return {
                symbol: quote["01. symbol"],
                name: symbol, // Alpha Vantage doesn't provide company name in this endpoint
                price: parseFloat(quote["05. price"]),
                change: parseFloat(quote["09. change"]),
                changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
                volume: parseInt(quote["06. volume"]),
                dayHigh: parseFloat(quote["03. high"]),
                dayLow: parseFloat(quote["04. low"]),
                previousClose: parseFloat(quote["08. previous close"]),
                marketCap: "N/A", // Not available in this endpoint
                sector: "Unknown",
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Fetch multiple stocks from Alpha Vantage
     * @param {Array<string>} symbols - Array of stock symbols
     * @returns {Promise<Array>} Array of stock data
     */
    async fetchMultipleRealStocks(symbols) {
        const results = [];
        const errors = [];

        // Fetch stocks with a delay to respect rate limits (5 calls per minute for free tier)
        for (let i = 0; i < symbols.length; i++) {
            try {
                const stockData = await this.fetchRealStockData(symbols[i]);
                results.push(stockData);

                // Add delay between requests (12 seconds for free tier = 5 calls per minute)
                if (i < symbols.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 12000));
                }
            } catch (error) {
                errors.push({ symbol: symbols[i], error: error.message });
            }
        }

        return { results, errors };
    }
    /**
     * Load all initial data needed for the stocks page
     * @returns {Promise<Object>} Object containing availableStocks, portfolio, and watchlist
     */
    async loadInitialData() {
        try {
            // Load data from server using Promise.allSettled to handle partial failures
            const [stocksResponse, portfolioResponse, watchlistResponse] =
                await Promise.allSettled([
                    stockAPI.getAvailableStocks(),
                    stockAPI.getPortfolio(),
                    stockAPI.getWatchlist(),
                ]);

            // Process available stocks
            let availableStocks = [];
            if (stocksResponse.status === "fulfilled" && stocksResponse.value.success) {
                availableStocks = stocksResponse.value.data || [];
            }

            // Fallback to real or mock data if server fails
            if (availableStocks.length === 0) {
                if (this.alphaVantageConfig.apiKey && this.alphaVantageConfig.apiKey !== "demo") {
                    try {
                        // For now, let's try just one stock to test
                        const testStock = await this.fetchRealStockData("AAPL");
                        availableStocks = [testStock];
                    } catch (error) {
                        availableStocks = mockStocksData.availableStocks || [];
                    }
                } else {
                    availableStocks = mockStocksData.availableStocks || [];
                }
            }

            // Process portfolio
            let portfolio = [];
            if (portfolioResponse.status === "fulfilled" && portfolioResponse.value.success) {
                portfolio = portfolioResponse.value.data || [];
            }

            // Process watchlist
            let watchlist = [];
            if (watchlistResponse.status === "fulfilled" && watchlistResponse.value.success) {
                watchlist = watchlistResponse.value.data || [];
            }

            return {
                success: true,
                data: {
                    availableStocks: availableStocks.length > 0 ? availableStocks : mockStocksData.availableStocks || [],
                    portfolio,
                    watchlist,
                },
            };
        } catch (error) {
            console.error("Error in loadInitialData:", error);
            return {
                success: false,
                error: "Failed to load stock data",
                data: {
                    availableStocks: mockStocksData.availableStocks || [],
                    portfolio: [],
                    watchlist: [],
                },
            };
        }
    }    /**
     * Buy stocks
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
     * Sell stocks
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
     * Add stock to watchlist
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
                // Server will get the stock name and current price from its mock data
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
     * Remove stock from watchlist
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

    /**
     * Refresh stock prices with real-time data
     * @param {Array} stocks - Current stock data
     * @returns {Promise<Array>} Updated stock data with real prices
     */
    async refreshStockPrices(stocks) {
        if (!Array.isArray(stocks) || stocks.length === 0) {
            return [];
        }

        // Only refresh if we have a valid API key
        if (!this.alphaVantageConfig.apiKey || this.alphaVantageConfig.apiKey === "demo") {
            console.warn("No Alpha Vantage API key available for price refresh");
            return stocks;
        }

        console.log("Refreshing stock prices with real-time data...");
        const symbols = stocks.map(stock => stock.symbol);

        try {
            const realDataResult = await this.fetchMultipleRealStocks(symbols);

            // Merge real data with existing stock data
            const updatedStocks = stocks.map(stock => {
                const realData = realDataResult.results.find(real => real.symbol === stock.symbol);

                if (realData) {
                    return {
                        ...stock,
                        price: realData.price,
                        change: realData.change,
                        changePercent: realData.changePercent,
                        volume: realData.volume,
                        dayHigh: realData.dayHigh,
                        dayLow: realData.dayLow,
                        lastUpdated: new Date().toISOString(),
                    };
                }

                return stock;
            });

            console.log(`Updated ${realDataResult.results.length} stocks with real-time data`);
            return updatedStocks;
        } catch (error) {
            console.error("Failed to refresh stock prices:", error);
            return stocks; // Return original data if refresh fails
        }
    }

    /**
     * Get API status and usage information
     * @returns {Object} API status information
     */
    getApiStatus() {
        return {
            alphaVantageConfigured: this.alphaVantageConfig.apiKey && this.alphaVantageConfig.apiKey !== "demo",
            apiKey: this.alphaVantageConfig.apiKey ? `${this.alphaVantageConfig.apiKey.substring(0, 4)}...` : "Not configured",
            rateLimits: {
                alphaVantage: "5 calls per minute (free tier)",
            },
            baseUrl: this.alphaVantageConfig.baseUrl,
        };
    }

    /**
     * Test the Alpha Vantage API connection
     * @returns {Promise<Object>} Test result
     */
    async testApiConnection() {
        console.log("🧪 Testing Alpha Vantage API connection...");
        console.log("📋 API Status:", this.getApiStatus());

        try {
            const testStock = await this.fetchRealStockData("AAPL");
            console.log("✅ API Connection successful!", testStock);

            return {
                success: true,
                message: "API connection successful",
                data: testStock,
                status: this.getApiStatus(),
            };
        } catch (error) {
            console.error("❌ API Connection failed:", error.message);

            return {
                success: false,
                message: `API connection failed: ${error.message}`,
                error: error.message,
                status: this.getApiStatus(),
            };
        }
    }
}

// Export a singleton instance
export const stocksService = new StocksService();
