/**
 * Database connection utility
 * 
 * This module handles the MongoDB connection.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aws-pricing-tool';

/**
 * Connect to MongoDB
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Close MongoDB connection
 * @returns {Promise<void>}
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error(`Error closing MongoDB connection: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  closeDB,
  connection: mongoose.connection
};
