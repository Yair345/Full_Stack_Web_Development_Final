// Mock data for stocks functionality
export const mockStocksData = {
    availableStocks: [
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
            marketCap: "2.8T"
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
            marketCap: "2.5T"
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
            marketCap: "1.6T"
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
            marketCap: "1.5T"
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
            marketCap: "758B"
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
            marketCap: "2.1T"
        },
        {
            symbol: "META",
            name: "Meta Platforms Inc.",
            sector: "Technology",
            price: 315.75,
            change: -4.25,
            changePercent: -1.33,
            dayHigh: 321.50,
            dayLow: 312.90,
            volume: 23456780,
            marketCap: "800B"
        },
        {
            symbol: "NFLX",
            name: "Netflix Inc.",
            sector: "Communication Services",
            price: 445.60,
            change: 8.90,
            changePercent: 2.04,
            dayHigh: 449.80,
            dayLow: 438.20,
            volume: 15789400,
            marketCap: "198B"
        },
        {
            symbol: "JPM",
            name: "JPMorgan Chase & Co.",
            sector: "Financial",
            price: 155.40,
            change: 1.25,
            changePercent: 0.81,
            dayHigh: 157.20,
            dayLow: 153.85,
            volume: 12456780,
            marketCap: "455B"
        },
        {
            symbol: "V",
            name: "Visa Inc.",
            sector: "Financial",
            price: 245.80,
            change: -0.75,
            changePercent: -0.30,
            dayHigh: 248.30,
            dayLow: 244.60,
            volume: 8901230,
            marketCap: "520B"
        },
        {
            symbol: "JNJ",
            name: "Johnson & Johnson",
            sector: "Healthcare",
            price: 162.35,
            change: 0.85,
            changePercent: 0.53,
            dayHigh: 163.70,
            dayLow: 161.20,
            volume: 7654321,
            marketCap: "432B"
        },
        {
            symbol: "PG",
            name: "Procter & Gamble Co.",
            sector: "Consumer Staples",
            price: 148.90,
            change: -0.45,
            changePercent: -0.30,
            dayHigh: 150.20,
            dayLow: 147.80,
            volume: 6789012,
            marketCap: "355B"
        }
    ],

    portfolio: [
        {
            id: 1,
            symbol: "AAPL",
            name: "Apple Inc.",
            quantity: 50,
            averagePurchasePrice: 175.50,
            currentPrice: 178.25,
            totalValue: 8912.50,
            gain: 137.50,
            gainPercent: 1.57
        },
        {
            id: 2,
            symbol: "MSFT",
            name: "Microsoft Corporation",
            quantity: 25,
            averagePurchasePrice: 340.00,
            currentPrice: 342.60,
            totalValue: 8565.00,
            gain: 65.00,
            gainPercent: 0.76
        },
        {
            id: 3,
            symbol: "TSLA",
            name: "Tesla Inc.",
            quantity: 15,
            averagePurchasePrice: 230.00,
            currentPrice: 238.45,
            totalValue: 3576.75,
            gain: 126.75,
            gainPercent: 3.67
        }
    ],

    watchlist: [
        {
            id: 1,
            symbol: "GOOGL",
            name: "Alphabet Inc.",
            currentPrice: 125.80,
            change: 3.45,
            changePercent: 2.82,
            addedDate: "2024-12-15T10:30:00Z"
        },
        {
            id: 2,
            symbol: "NVDA",
            name: "NVIDIA Corporation",
            currentPrice: 875.20,
            change: 15.60,
            changePercent: 1.81,
            addedDate: "2024-12-14T14:15:00Z"
        }
    ],

    totalPortfolioValue: 21054.25,
    totalGain: 329.25,
    totalGainPercent: 1.59
};

// External API configuration for future integration
export const STOCK_API_CONFIG = {
    // Example configuration for Alpha Vantage API
    ALPHA_VANTAGE: {
        baseUrl: "https://www.alphavantage.co/query",
        apiKey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "demo",
        endpoints: {
            quote: "GLOBAL_QUOTE",
            search: "SYMBOL_SEARCH",
            dailyAdjusted: "TIME_SERIES_DAILY_ADJUSTED",
            intraday: "TIME_SERIES_INTRADAY"
        }
    },
    // Example configuration for Yahoo Finance API
    YAHOO_FINANCE: {
        baseUrl: "https://query1.finance.yahoo.com/v8/finance/chart",
        endpoints: {
            quote: "/quote",
            search: "/search",
            chart: "/chart"
        }
    },
    // Example configuration for IEX Cloud API
    IEX_CLOUD: {
        baseUrl: "https://cloud.iexapis.com/stable",
        apiKey: import.meta.env.VITE_IEX_API_KEY || "demo",
        endpoints: {
            quote: "/stock/{symbol}/quote",
            batch: "/stock/market/batch",
            search: "/search/{query}"
        }
    }
};

// Utility functions for API integration
export const stockApiUtils = {
    // Format symbol for API requests
    formatSymbol: (symbol) => symbol.toUpperCase().trim(),

    // Parse API response to internal format
    parseStockData: (apiData, provider = "ALPHA_VANTAGE") => {
        switch (provider) {
            case "ALPHA_VANTAGE":
                return {
                    symbol: apiData["01. symbol"],
                    price: parseFloat(apiData["05. price"]),
                    change: parseFloat(apiData["09. change"]),
                    changePercent: parseFloat(apiData["10. change percent"].replace("%", "")),
                    volume: parseInt(apiData["06. volume"]),
                    dayHigh: parseFloat(apiData["03. high"]),
                    dayLow: parseFloat(apiData["04. low"])
                };
            case "IEX_CLOUD":
                return {
                    symbol: apiData.symbol,
                    price: apiData.latestPrice,
                    change: apiData.change,
                    changePercent: apiData.changePercent * 100,
                    volume: apiData.latestVolume,
                    dayHigh: apiData.high,
                    dayLow: apiData.low,
                    marketCap: apiData.marketCap
                };
            default:
                return apiData;
        }
    },

    // Build API URL
    buildApiUrl: (provider, endpoint, params = {}) => {
        const config = STOCK_API_CONFIG[provider];
        if (!config) return null;

        const url = new URL(config.baseUrl);

        // Add API key if required
        if (config.apiKey && config.apiKey !== "demo") {
            url.searchParams.append("apikey", config.apiKey);
        }

        // Add endpoint-specific parameters
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        return url.toString();
    },

    // Validate API response
    validateApiResponse: (response) => {
        if (!response || typeof response !== 'object') {
            throw new Error("Invalid API response format");
        }

        if (response.error || response["Error Message"]) {
            throw new Error(response.error || response["Error Message"]);
        }

        return true;
    }
};

// Common utility functions for stock data normalization
export const stockDataUtils = {
    // Normalize stock data from different sources (Market, Portfolio, Watchlist)
    normalizeStockData: (stock, source = 'market') => {
        const normalized = {
            // Basic stock info
            symbol: stock.symbol || stock.stockSymbol || stock.stock_symbol || "N/A",
            name: stock.name || stock.stockName || stock.stock_name || stock.companyName || "Unknown Company",
            
            // Price data
            currentPrice: stock.price || stock.currentPrice || stock.current_price || 0,
            
            // Daily change data - this is the key normalization
            dailyChange: 0,
            dailyChangePercent: 0,
            
            // Additional data - try multiple field name variations
            volume: stock.volume || stock.dailyVolume || stock.daily_volume || 0,
            dayHigh: stock.dayHigh || stock.high || stock.dailyHigh || stock.daily_high || stock.price || stock.currentPrice || stock.current_price || 0,
            dayLow: stock.dayLow || stock.low || stock.dailyLow || stock.daily_low || stock.price || stock.currentPrice || stock.current_price || 0,
            
            // Timestamps
            addedDate: stock.addedDate || stock.createdAt || stock.created_at || new Date(),
            lastUpdate: stock.lastPriceUpdate || stock.last_price_update || new Date()
        };

        // Normalize daily change based on source
        switch (source) {
            case 'market':
                normalized.dailyChange = stock.change || stock.dailyChange || stock.daily_change || 0;
                normalized.dailyChangePercent = stock.changePercent || stock.dailyChangePercent || stock.daily_change_percent || 0;
                // Extract additional market data
                normalized.volume = stock.volume || stock.dailyVolume || stock.daily_volume || 0;
                normalized.dayHigh = stock.dayHigh || stock.high || stock.dailyHigh || stock.daily_high || normalized.currentPrice;
                normalized.dayLow = stock.dayLow || stock.low || stock.dailyLow || stock.daily_low || normalized.currentPrice;
                break;
            case 'portfolio':
                normalized.dailyChange = stock.dailyChange || stock.daily_change || stock.change || stock.priceChange || stock.price_change || 0;
                normalized.dailyChangePercent = stock.dailyChangePercent || stock.daily_change_percent || stock.changePercent || stock.priceChangePercent || stock.price_change_percent || 0;
                // Additional portfolio-specific data
                normalized.quantity = stock.totalQuantity || stock.total_quantity || stock.quantity || 0;
                normalized.averagePurchasePrice = stock.averagePurchasePrice || stock.average_purchase_price || stock.avgPrice || 0;
                normalized.totalInvested = stock.totalInvested || stock.total_invested || 0;
                normalized.currentValue = stock.currentValue || stock.current_value || (normalized.quantity * normalized.currentPrice) || 0;
                normalized.totalGain = stock.unrealizedGainLoss || stock.unrealized_gain_loss || stock.totalGain || stock.gain || 0;
                normalized.totalGainPercent = stock.unrealizedGainLossPercent || stock.unrealized_gain_loss_percent || stock.gainPercent || 0;
                
                // Enhanced fallback logic for daily change data
                if (!normalized.dailyChange || normalized.dailyChange === 0) {
                    // Try to extract from additional fields
                    if (stock.currentPrice && stock.previousClose) {
                        normalized.dailyChange = stock.currentPrice - stock.previousClose;
                        normalized.dailyChangePercent = stock.previousClose > 0 ? ((normalized.dailyChange / stock.previousClose) * 100) : 0;
                    } else if (stock.openPrice && stock.currentPrice) {
                        // Alternative: use opening price as reference
                        normalized.dailyChange = stock.currentPrice - stock.openPrice;
                        normalized.dailyChangePercent = stock.openPrice > 0 ? ((normalized.dailyChange / stock.openPrice) * 100) : 0;
                    }
                }
                
                // Ensure we have the same volume and range data as market
                normalized.volume = stock.volume || stock.dailyVolume || stock.daily_volume || 0;
                normalized.dayHigh = stock.dayHigh || stock.high || stock.dailyHigh || stock.daily_high || normalized.currentPrice;
                normalized.dayLow = stock.dayLow || stock.low || stock.dailyLow || stock.daily_low || normalized.currentPrice;
                break;
            case 'watchlist':
                normalized.dailyChange = stock.priceChange || stock.price_change || stock.change || stock.dailyChange || stock.daily_change || 0;
                normalized.dailyChangePercent = stock.priceChangePercent || stock.price_change_percent || stock.changePercent || stock.dailyChangePercent || stock.daily_change_percent || 0;
                normalized.addedPrice = stock.addedPrice || stock.added_price || 0;
                // Extract volume from server data if available
                normalized.volume = stock.volume || stock.dailyVolume || stock.daily_volume || 0;
                break;
        }

        return normalized;
    },

    // Check if daily change is positive
    isDailyChangePositive: (stock) => {
        const normalized = typeof stock.dailyChange !== 'undefined' 
            ? stock 
            : stockDataUtils.normalizeStockData(stock);
        return normalized.dailyChange >= 0;
    },

    // Format price with currency
    formatPrice: (price) => {
        return `$${(price || 0).toFixed(2)}`;
    },

    // Format change with sign and percentage
    formatDailyChange: (change, changePercent) => {
        const isPositive = change >= 0;
        const sign = isPositive ? "+" : "";
        return `${sign}$${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
    },

    // Get appropriate CSS class for change display
    getChangeClass: (change) => {
        return change >= 0 ? "text-success" : "text-danger";
    },

    // Get appropriate icon component for change display
    getChangeIcon: (change, TrendingUpIcon, TrendingDownIcon) => {
        return change >= 0 ? TrendingUpIcon : TrendingDownIcon;
    },

    // Merge market data with portfolio/watchlist data to ensure consistency
    mergeWithMarketData: (stock, marketData, source = 'portfolio') => {
        const normalized = stockDataUtils.normalizeStockData(stock, source);
        
        // Find matching market data by symbol
        const marketStock = Array.isArray(marketData) 
            ? marketData.find(m => m.symbol === normalized.symbol)
            : null;
            
        if (marketStock) {
            const marketNormalized = stockDataUtils.normalizeStockData(marketStock, 'market');
            
            // Override daily change data with market data for consistency
            normalized.dailyChange = marketNormalized.dailyChange;
            normalized.dailyChangePercent = marketNormalized.dailyChangePercent;
            normalized.volume = marketNormalized.volume;
            normalized.dayHigh = marketNormalized.dayHigh;
            normalized.dayLow = marketNormalized.dayLow;
        }
        
        return normalized;
    }
};

export default mockStocksData;
