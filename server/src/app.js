const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Import middleware
const { requestLogging } = require('./middleware/logger.middleware');
const { globalErrorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');

// Import routes
const routes = require('./routes');

// Import configuration
const { config } = require('./config/config');

// Create Express app
const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow configured origins
        const allowedOrigins = Array.isArray(config.cors.origin)
            ? config.cors.origin
            : [config.cors.origin];

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // In development, allow any localhost origin
        if (config.server.env === 'development' && origin.includes('localhost')) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (apply to all routes)
app.use(generalLimiter);

// Request logging
app.use(requestLogging);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.server.env,
        version: process.env.npm_package_version || '1.0.0'
    });
});

// API routes
app.use('/api/v1', routes);

// Catch 404 errors
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
