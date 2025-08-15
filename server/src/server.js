#!/usr/bin/env node

const http = require('http');
const app = require('./app');
const { initConfig } = require('./config/config');
const { connectDB, closeDB } = require('./config/database');
const { connectMongoDB } = require('./config/mongodb');
const { initSocketIO } = require('./websocket/socket');

// Initialize configuration
const config = initConfig();

// Normalize port
const normalizePort = (val) => {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
};

const port = normalizePort(config.server.port);
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocketIO(server);

// Event listener for HTTP server "error" event
const onError = (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// Event listener for HTTP server "listening" event
const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;

    console.log(`
🚀 Bank App Server is running!
📍 Environment: ${config.server.env}
🌐 Server: http://${config.server.host}:${addr.port}
📊 Health Check: http://${config.server.host}:${addr.port}/health
🔗 API Base: http://${config.server.host}:${addr.port}/api/v1
📝 Process ID: ${process.pid}
⏰ Started at: ${new Date().toISOString()}
  `);
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(() => {
        console.log('✅ HTTP server closed');
    });

    try {
        // Close database connections
        await closeDB();
        console.log('✅ Database connections closed');

        // Close other connections if needed
        // await redis.quit();

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
};

// Database connection and server startup
const startServer = async () => {
    try {
        // Initialize database connection
        console.log('🔄 Connecting to database...');
        await connectDB();

        // Initialize MongoDB connection (optional)
        console.log('🔄 Connecting to MongoDB...');
        try {
            const mongoConnection = await connectMongoDB();
            if (mongoConnection) {
                console.log('✅ MongoDB connected successfully - Audit logging enabled');
            } else {
                console.warn('⚠️ MongoDB connection failed - Audit logging disabled');
            }
        } catch (mongoError) {
            console.error('❌ MongoDB connection error:', mongoError.message);
            console.warn('⚠️ Continuing without audit logs');
        }

        // Start the server
        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);

        // Graceful shutdown handlers
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Start the server
startServer();
