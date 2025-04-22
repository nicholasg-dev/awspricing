/**
 * Jest configuration for backend testing
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  // Setup files to run before tests
  setupFilesAfterEnv: ['./tests/setup.js'],
  // Timeout for tests
  testTimeout: 30000,
};
