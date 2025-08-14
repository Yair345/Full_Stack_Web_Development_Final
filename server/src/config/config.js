require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_HOST',
    'DB_USER',
    'DB_NAME'
];

const validateEnvVars = () => {
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        process.exit(1);
    }
};

// App configuration object
const config = {
    // Server configuration
    server: {
        port: process.env.PORT || 5000,
        env: process.env.NODE_ENV || 'development',
        host: process.env.HOST || 'localhost'
    },

    // Database configuration
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME,
        mongoUri: process.env.MONGO_URI
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRE || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    },

    // Email configuration
    email: {
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_APP_PASSWORD,
        from: process.env.GMAIL_USER || 'noreply@bankapp.com'
    },

    // Redis configuration
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || ''
    },

    // Rate limiting configuration
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || 100) // 100 requests per window
    },

    // File upload configuration
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || 5242880), // 5MB
        allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
            'image/jpeg',
            'image/png',
            'application/pdf'
        ]
    },

    // CORS configuration
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true
    },

    // Encryption configuration
    encryption: {
        key: process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this'
    },

    // Banking specific configuration
    banking: {
        defaultCurrency: 'USD',
        maxTransactionAmount: 100000,
        minTransactionAmount: 0.01,
        interestRates: {
            savings: 0.025, // 2.5%
            checking: 0.001, // 0.1%
            credit: 0.18 // 18%
        },
        fees: {
            transfer: 2.50,
            withdrawal: 1.00,
            overdraft: 35.00
        }
    }
};

// Initialize configuration
const initConfig = () => {
    validateEnvVars();
    console.log(`🚀 Server configured for ${config.server.env} environment`);
    return config;
};

module.exports = {
    config,
    initConfig,
    validateEnvVars
};
