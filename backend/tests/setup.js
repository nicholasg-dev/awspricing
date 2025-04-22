/**
 * Jest setup file for backend testing
 * 
 * This file runs before all tests to set up the test environment.
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// MongoDB memory server instance
let mongoServer;

// Connect to in-memory MongoDB before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set MongoDB URI for tests
  process.env.MONGODB_URI = mongoUri;
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect and stop MongoDB server after all tests
afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Global test timeout
jest.setTimeout(30000);
