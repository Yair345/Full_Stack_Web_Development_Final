require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const { requestLogger: logger } = require('./src/middleware/logger.middleware');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Connect to database
        await connectDB();
        logger.info('✅ Database connected successfully');

        // Start the server
        app.listen(PORT, () => {
            logger.info(`🚀 Server is running on port ${PORT}`);
            logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🌐 Health check: http://localhost:${PORT}/health`);
            logger.info(`📚 API base URL: http://localhost:${PORT}/api/v1`);
        });

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

startServer();
