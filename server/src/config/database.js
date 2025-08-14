const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bank_db',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+00:00'
};

// Create Sequelize instance
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.user,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        timezone: dbConfig.timezone,
        define: {
            timestamps: true,
            underscored: true,
            paranoid: true // Enables soft deletes
        }
    }
);

// Function to create database if it doesn't exist
const createDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        await connection.end();
        console.log(`Database ${dbConfig.database} created or already exists`);
    } catch (error) {
        console.error('Error creating database:', error.message);
        throw error;
    }
};

// Function to connect to database
const connectDB = async () => {
    try {
        // First create the database if it doesn't exist
        await createDatabase();

        // Test the connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');

        // Sync models (create tables)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Database models synchronized');
        }

        return sequelize;
    } catch (error) {
        console.error('❌ Unable to connect to database:', error.message);
        throw error;
    }
};

// Function to close database connection
const closeDB = async () => {
    try {
        await sequelize.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error.message);
    }
};

module.exports = {
    sequelize,
    connectDB,
    closeDB,
    dbConfig
};
