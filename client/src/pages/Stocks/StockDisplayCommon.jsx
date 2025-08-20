import { TrendingUp, TrendingDown } from "lucide-react";
import { stockDataUtils } from "./stocksUtils";

/**
 * Common component for displaying stock price and daily change
 * Used across Market, Portfolio, and Watchlist tabs for consistency
 */
export const StockPriceDisplay = ({ 
    stock, 
    source = 'market', 
    size = 'normal', 
    showPositionGain = false,
    customChange = null,
    customChangePercent = null 
}) => {
    const normalized = stockDataUtils.normalizeStockData(stock, source);
    
    // Use custom change values if provided (for portfolio position gains)
    const changeValue = customChange !== null ? customChange : normalized.dailyChange;
    const changePercent = customChangePercent !== null ? customChangePercent : normalized.dailyChangePercent;
    const isPositive = changeValue >= 0;
    
    const sizeClasses = {
        small: { price: 'h6', change: 'small' },
        normal: { price: 'h5', change: 'small' },
        large: { price: 'h4', change: '' }
    };
    
    const currentSize = sizeClasses[size] || sizeClasses.normal;

    return (
        <div className="text-end">
            <div className={`mb-1 fw-bold ${currentSize.price}`}>
                {stockDataUtils.formatPrice(normalized.currentPrice)}
            </div>
            <div className={`${currentSize.change} ${stockDataUtils.getChangeClass(changeValue)}`}>
                {isPositive ? (
                    <TrendingUp size={14} />
                ) : (
                    <TrendingDown size={14} />
                )}
                <span className="ms-1">
                    {stockDataUtils.formatDailyChange(changeValue, changePercent)}
                </span>
            </div>
        </div>
    );
};

/**
 * Common component for displaying stock basic info
 */
export const StockInfoDisplay = ({ stock, source = 'market' }) => {
    const normalized = stockDataUtils.normalizeStockData(stock, source);
    
    return (
        <div>
            <h6 className="fw-bold mb-1">{normalized.symbol}</h6>
            <p className="text-muted small mb-0">{normalized.name}</p>
        </div>
    );
};

/**
 * Common component for daily change in detailed views (like Portfolio details)
 */
export const DailyChangeDisplay = ({ stock, source = 'market', label = "Day Change" }) => {
    const normalized = stockDataUtils.normalizeStockData(stock, source);
    const isPositive = stockDataUtils.isDailyChangePositive(normalized);
    
    return (
        <div className="col-6">
            <div className="text-muted">{label}</div>
            <div className={`fw-medium ${stockDataUtils.getChangeClass(normalized.dailyChange)}`}>
                {stockDataUtils.formatPrice(normalized.dailyChange)}
            </div>
        </div>
    );
};

/**
 * Common component for daily change percentage in detailed views
 */
export const DailyChangePercentDisplay = ({ stock, source = 'market', label = "Day Change %" }) => {
    const normalized = stockDataUtils.normalizeStockData(stock, source);
    const isPositive = stockDataUtils.isDailyChangePositive(normalized);
    
    return (
        <div className="col-6">
            <div className="text-muted">{label}</div>
            <div className={`fw-medium ${stockDataUtils.getChangeClass(normalized.dailyChange)}`}>
                {isPositive ? "+" : ""}{normalized.dailyChangePercent.toFixed(2)}%
            </div>
        </div>
    );
};

export default {
    StockPriceDisplay,
    StockInfoDisplay,
    DailyChangeDisplay,
    DailyChangePercentDisplay
};
