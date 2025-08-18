const axios = require('axios');

/**
 * Stock market API service for integrating with external APIs
 * Currently supports Alpha Vantage, IEX Cloud, and Yahoo Finance
 */
class StockApiService {
    constructor() {
        this.apiKeys = {
            alphaVantage: process.env.ALPHA_VANTAGE_API_KEY,
            iexCloud: process.env.IEX_CLOUD_API_KEY
        };

        this.baseUrls = {
            alphaVantage: 'https://www.alphavantage.co/query',
            iexCloud: 'https://cloud.iexapis.com/stable',
            yahooFinance: 'https://query1.finance.yahoo.com/v8/finance'
        };

        // API rate limits (requests per minute)
        this.rateLimits = {
            alphaVantage: 5,
            iexCloud: 100,
            yahooFinance: 2000
        };

        // Request counters for rate limiting
        this.requestCounters = {};

        // Initialize rate limit counters
        Object.keys(this.rateLimits).forEach(provider => {
            this.requestCounters[provider] = {
                count: 0,
                resetTime: Date.now() + 60000 // Reset every minute
            };
        });
    }

    /**
     * Check if API key is available for provider
     */
    isApiKeyAvailable(provider) {
        switch (provider) {
            case 'alphaVantage':
                return !!this.apiKeys.alphaVantage && this.apiKeys.alphaVantage !== 'demo';
            case 'iexCloud':
                return !!this.apiKeys.iexCloud && this.apiKeys.iexCloud !== 'demo';
            case 'yahooFinance':
                return true; // No API key required for basic endpoints
            default:
                return false;
        }
    }

    /**
     * Check rate limit for provider
     */
    checkRateLimit(provider) {
        const now = Date.now();
        const counter = this.requestCounters[provider];

        // Reset counter if time window passed
        if (now > counter.resetTime) {
            counter.count = 0;
            counter.resetTime = now + 60000;
        }

        return counter.count < this.rateLimits[provider];
    }

    /**
     * Increment request counter for provider
     */
    incrementRequestCounter(provider) {
        if (this.requestCounters[provider]) {
            this.requestCounters[provider].count++;
        }
    }

    /**
     * Get stock quote from Alpha Vantage
     */
    async getQuoteFromAlphaVantage(symbol) {
        if (!this.isApiKeyAvailable('alphaVantage')) {
            throw new Error('Alpha Vantage API key not configured');
        }

        if (!this.checkRateLimit('alphaVantage')) {
            throw new Error('Alpha Vantage rate limit exceeded');
        }

        try {
            const response = await axios.get(this.baseUrls.alphaVantage, {
                params: {
                    function: 'GLOBAL_QUOTE',
                    symbol: symbol.toUpperCase(),
                    apikey: this.apiKeys.alphaVantage
                },
                timeout: 10000
            });

            this.incrementRequestCounter('alphaVantage');

            const data = response.data['Global Quote'];
            if (!data || Object.keys(data).length === 0) {
                throw new Error('No data returned from Alpha Vantage');
            }

            return this.parseAlphaVantageResponse(data);
        } catch (error) {
            console.error(`Alpha Vantage API error for ${symbol}:`, error.message);
            throw error;
        }
    }

    /**
     * Get stock quote from IEX Cloud
     */
    async getQuoteFromIEXCloud(symbol) {
        if (!this.isApiKeyAvailable('iexCloud')) {
            throw new Error('IEX Cloud API key not configured');
        }

        if (!this.checkRateLimit('iexCloud')) {
            throw new Error('IEX Cloud rate limit exceeded');
        }

        try {
            const response = await axios.get(
                `${this.baseUrls.iexCloud}/stock/${symbol.toLowerCase()}/quote`,
                {
                    params: { token: this.apiKeys.iexCloud },
                    timeout: 10000
                }
            );

            this.incrementRequestCounter('iexCloud');

            return this.parseIEXCloudResponse(response.data);
        } catch (error) {
            console.error(`IEX Cloud API error for ${symbol}:`, error.message);
            throw error;
        }
    }

    /**
     * Get stock quote from Yahoo Finance (free but unofficial)
     */
    async getQuoteFromYahooFinance(symbol) {
        if (!this.checkRateLimit('yahooFinance')) {
            throw new Error('Yahoo Finance rate limit exceeded');
        }

        try {
            const response = await axios.get(
                `${this.baseUrls.yahooFinance}/chart/${symbol.toUpperCase()}`,
                {
                    params: {
                        interval: '1d',
                        range: '1d'
                    },
                    timeout: 10000
                }
            );

            this.incrementRequestCounter('yahooFinance');

            const data = response.data?.chart?.result?.[0];
            if (!data) {
                throw new Error('No data returned from Yahoo Finance');
            }

            return this.parseYahooFinanceResponse(data);
        } catch (error) {
            console.error(`Yahoo Finance API error for ${symbol}:`, error.message);
            throw error;
        }
    }

    /**
     * Parse Alpha Vantage response
     */
    parseAlphaVantageResponse(data) {
        return {
            symbol: data['01. symbol'],
            name: `${data['01. symbol']} Inc.`,
            price: parseFloat(data['05. price']),
            change: parseFloat(data['09. change']),
            changePercent: parseFloat(data['10. change percent'].replace('%', '')),
            volume: parseInt(data['06. volume']),
            high: parseFloat(data['03. high']),
            low: parseFloat(data['04. low']),
            open: parseFloat(data['02. open']),
            previousClose: parseFloat(data['08. previous close']),
            source: 'ALPHA_VANTAGE'
        };
    }

    /**
     * Parse IEX Cloud response
     */
    parseIEXCloudResponse(data) {
        return {
            symbol: data.symbol,
            name: data.companyName,
            price: data.latestPrice,
            change: data.change,
            changePercent: data.changePercent * 100,
            volume: data.latestVolume,
            high: data.high,
            low: data.low,
            open: data.iexOpen || data.open,
            previousClose: data.previousClose,
            marketCap: data.marketCap,
            peRatio: data.peRatio,
            week52High: data.week52High,
            week52Low: data.week52Low,
            source: 'IEX_CLOUD'
        };
    }

    /**
     * Parse Yahoo Finance response
     */
    parseYahooFinanceResponse(data) {
        const meta = data.meta;
        const quote = data.indicators?.quote?.[0];

        if (!meta || !quote) {
            throw new Error('Invalid Yahoo Finance response format');
        }

        const latestPrice = meta.regularMarketPrice || meta.previousClose;
        const previousClose = meta.previousClose;
        const change = latestPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        return {
            symbol: meta.symbol,
            name: `${meta.symbol} Inc.`,
            price: latestPrice,
            change: change,
            changePercent: changePercent,
            volume: quote.volume?.[quote.volume.length - 1],
            high: meta.regularMarketDayHigh,
            low: meta.regularMarketDayLow,
            open: quote.open?.[0],
            previousClose: previousClose,
            source: 'YAHOO_FINANCE'
        };
    }

    /**
     * Get stock quote with fallback providers
     */
    async getStockQuote(symbol, preferredProvider = 'iexCloud') {
        const providers = [preferredProvider];

        // Add fallback providers
        if (preferredProvider !== 'iexCloud') providers.push('iexCloud');
        if (preferredProvider !== 'alphaVantage') providers.push('alphaVantage');
        if (preferredProvider !== 'yahooFinance') providers.push('yahooFinance');

        let lastError;

        for (const provider of providers) {
            try {
                switch (provider) {
                    case 'alphaVantage':
                        return await this.getQuoteFromAlphaVantage(symbol);
                    case 'iexCloud':
                        return await this.getQuoteFromIEXCloud(symbol);
                    case 'yahooFinance':
                        return await this.getQuoteFromYahooFinance(symbol);
                    default:
                        continue;
                }
            } catch (error) {
                lastError = error;
                console.warn(`Failed to get quote from ${provider} for ${symbol}:`, error.message);
                continue;
            }
        }

        throw new Error(`Failed to get quote for ${symbol} from all providers: ${lastError?.message}`);
    }

    /**
     * Search stocks by symbol or name
     */
    async searchStocks(query, limit = 10) {
        if (!this.isApiKeyAvailable('alphaVantage')) {
            throw new Error('Stock search requires Alpha Vantage API key');
        }

        if (!this.checkRateLimit('alphaVantage')) {
            throw new Error('Alpha Vantage rate limit exceeded');
        }

        try {
            const response = await axios.get(this.baseUrls.alphaVantage, {
                params: {
                    function: 'SYMBOL_SEARCH',
                    keywords: query,
                    apikey: this.apiKeys.alphaVantage
                },
                timeout: 10000
            });

            this.incrementRequestCounter('alphaVantage');

            const matches = response.data?.bestMatches || [];
            return matches.slice(0, limit).map(match => ({
                symbol: match['1. symbol'],
                name: match['2. name'],
                type: match['3. type'],
                region: match['4. region'],
                marketOpen: match['5. marketOpen'],
                marketClose: match['6. marketClose'],
                timezone: match['7. timezone'],
                currency: match['8. currency'],
                matchScore: parseFloat(match['9. matchScore'])
            }));
        } catch (error) {
            console.error('Stock search error:', error.message);
            throw error;
        }
    }

    /**
     * Get multiple stock quotes in batch
     */
    async getBatchQuotes(symbols, provider = 'iexCloud') {
        const results = [];
        const errors = [];

        // Process symbols in chunks to respect rate limits
        const chunkSize = provider === 'alphaVantage' ? 1 : 5;

        for (let i = 0; i < symbols.length; i += chunkSize) {
            const chunk = symbols.slice(i, i + chunkSize);
            const chunkPromises = chunk.map(async symbol => {
                try {
                    const quote = await this.getStockQuote(symbol, provider);
                    return { symbol, data: quote };
                } catch (error) {
                    return { symbol, error: error.message };
                }
            });

            const chunkResults = await Promise.all(chunkPromises);

            chunkResults.forEach(result => {
                if (result.error) {
                    errors.push(result);
                } else {
                    results.push(result.data);
                }
            });

            // Add delay between chunks for rate limiting
            if (i + chunkSize < symbols.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return { results, errors };
    }
}

module.exports = new StockApiService();
