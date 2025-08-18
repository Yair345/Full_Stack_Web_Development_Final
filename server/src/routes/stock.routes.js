const express = require('express');
const {
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
} = require('../controllers/stock.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateStockTransaction, validateWatchlistItem } = require('../middleware/validation.middleware');
const { transactionLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/v1/stocks
 * @desc    Get available stocks for trading
 * @access  Private
 */
router.get('/', getAvailableStocks);

/**
 * @route   GET /api/v1/stocks/search
 * @desc    Search stocks by symbol or name
 * @access  Private
 */
router.get('/search', searchStocks);

/**
 * @route   GET /api/v1/stocks/:symbol/quote
 * @desc    Get stock quote by symbol
 * @access  Private
 */
router.get('/:symbol/quote', getStockQuote);

/**
 * @route   POST /api/v1/stocks/buy
 * @desc    Buy stocks
 * @access  Private
 */
router.post('/buy', transactionLimiter, validateStockTransaction, buyStock);

/**
 * @route   POST /api/v1/stocks/sell
 * @desc    Sell stocks
 * @access  Private
 */
router.post('/sell', transactionLimiter, validateStockTransaction, sellStock);

/**
 * @route   GET /api/v1/stocks/transactions
 * @desc    Get user's stock transactions
 * @access  Private
 */
router.get('/transactions', getStockTransactions);

/**
 * @route   GET /api/v1/stocks/portfolio
 * @desc    Get user's portfolio
 * @access  Private
 */
router.get('/portfolio', getPortfolio);

/**
 * @route   GET /api/v1/stocks/watchlist
 * @desc    Get user's watchlist
 * @access  Private
 */
router.get('/watchlist', getWatchlist);

/**
 * @route   POST /api/v1/stocks/watchlist
 * @desc    Add stock to watchlist
 * @access  Private
 */
router.post('/watchlist', validateWatchlistItem, addToWatchlist);

/**
 * @route   DELETE /api/v1/stocks/watchlist/:id
 * @desc    Remove stock from watchlist
 * @access  Private
 */
router.delete('/watchlist/:id', removeFromWatchlist);

module.exports = router;
