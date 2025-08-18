# Stocks Page

A comprehensive stock trading and portfolio management interface for the SecureBank application.

## Features

-   **Stock Market Browser**: View available stocks with real-time pricing (mock data)
-   **Portfolio Management**: Track owned stocks and performance
-   **Watchlist**: Monitor stocks of interest
-   **Buy/Sell Functionality**: Execute stock transactions
-   **External API Ready**: Infrastructure prepared for real stock market data integration

## Component Structure

### Main Component

-   **Stocks.jsx** - Main orchestrator component managing state and tab navigation

### Header Component

-   **StocksHeader.jsx** - Dashboard header with portfolio summary and key metrics

### Navigation Component

-   **StocksTabs.jsx** - Tab navigation for Market, Portfolio, and Watchlist sections

### Feature Components

-   **StocksList.jsx** - Browse and purchase available stocks
-   **Portfolio.jsx** - Manage owned stocks and track performance
-   **StocksWatchlist.jsx** - Track and purchase watchlisted stocks

### Utilities

-   **stocksUtils.js** - Mock data, API configuration, and utility functions

## Current Implementation

### Mock Data

The page currently uses comprehensive mock data including:

-   12 major stocks with realistic pricing and metrics
-   Sample portfolio with 3 owned stocks
-   Pre-populated watchlist with 2 stocks
-   Portfolio performance calculations

### Features Implemented

1. **Stock Browsing**

    - Search and filter stocks
    - Sort by various criteria (symbol, price, change, volume)
    - View stock details (price, change, volume, market cap)

2. **Stock Purchasing**

    - Buy stocks with quantity selection
    - Real-time total calculation
    - Portfolio updates after purchase

3. **Portfolio Management**

    - View all owned stocks
    - Track gains/losses and percentages
    - Sell stocks with quantity selection
    - Portfolio summary with total values

4. **Watchlist Management**
    - Add stocks to watchlist from market view
    - Remove stocks from watchlist
    - Buy directly from watchlist
    - Track when stocks were added

## External API Integration

The page is prepared for external API integration with:

### Supported API Providers

-   **Alpha Vantage** - Financial market data
-   **Yahoo Finance** - Real-time quotes and historical data
-   **IEX Cloud** - Market data and company information

### API Configuration

```javascript
const STOCK_API_CONFIG = {
  ALPHA_VANTAGE: {
    baseUrl: "https://www.alphavantage.co/query",
    apiKey: process.env.REACT_APP_ALPHA_VANTAGE_API_KEY,
    endpoints: { ... }
  },
  // Additional providers...
}
```

### Utility Functions

-   `parseStockData()` - Convert API responses to internal format
-   `buildApiUrl()` - Construct API request URLs
-   `validateApiResponse()` - Validate and handle API responses

## Backend Requirements

To fully implement the stocks functionality, the following backend components need to be created:

### API Endpoints Needed

1. `GET /api/v1/stocks` - Fetch available stocks
2. `GET /api/v1/stocks/search?q={query}` - Search stocks
3. `GET /api/v1/stocks/{symbol}/quote` - Get real-time quote
4. `POST /api/v1/stocks/buy` - Execute buy order
5. `POST /api/v1/stocks/sell` - Execute sell order
6. `GET /api/v1/portfolio` - Get user's portfolio
7. `GET /api/v1/watchlist` - Get user's watchlist
8. `POST /api/v1/watchlist` - Add to watchlist
9. `DELETE /api/v1/watchlist/{id}` - Remove from watchlist

### Database Models Needed

1. **StockTransaction** - Record buy/sell transactions
2. **Portfolio** - User's stock holdings
3. **Watchlist** - User's tracked stocks
4. **StockQuote** - Cached stock data

## Usage

The Stocks page integrates with the existing routing system:

```jsx
import Stocks from "./pages/Stocks/Stocks";

// Add to App.jsx routing
<Route path="/stocks" element={<Stocks />} />;
```

## State Management

The component uses local state for:

-   Active tab management
-   Stock data and loading states
-   Buy/sell form states
-   Error handling

## Integration Points

-   **Layout Component** - Consistent page structure
-   **UI Components** - Card, Button, Input components
-   **API Service** - Ready for backend integration
-   **Redux Store** - Can be integrated for global state management

## Future Enhancements

1. **Real-time Data** - WebSocket integration for live price updates
2. **Advanced Charting** - Price history and technical analysis
3. **Order Types** - Limit orders, stop-loss, etc.
4. **Market News** - Stock-related news integration
5. **Alerts** - Price alerts and notifications
6. **Research Tools** - Company fundamentals and analyst ratings

## Environment Variables

For external API integration, set these environment variables:

```env
REACT_APP_ALPHA_VANTAGE_API_KEY=your_api_key_here
REACT_APP_IEX_API_KEY=your_api_key_here
```
