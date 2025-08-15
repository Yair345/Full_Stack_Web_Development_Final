const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log('MongoDB URI not provided, skipping MongoDB connection');
            return null;
        }

        console.log('🔄 Connecting to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGO_URI);

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Test the connection with a simple operation
        await conn.connection.db.admin().ping();
        console.log('🏓 MongoDB ping successful');

        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('❌ Full error:', error);
        return null;
    }
};

// Audit Log Schema for MongoDB
const auditLogSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    resource: {
        type: String,
        required: true
    },
    resourceId: {
        type: String
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    level: {
        type: String,
        enum: ['info', 'warning', 'error', 'critical'],
        default: 'info'
    }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// System Log Schema
const systemLogSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: ['debug', 'info', 'warning', 'error', 'critical'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    meta: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

module.exports = {
    connectMongoDB,
    AuditLog,
    SystemLog
};
