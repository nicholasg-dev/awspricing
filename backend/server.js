const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const instanceRoutes = require('./src/routes/instanceRoutes');
const alertRoutes = require('./src/routes/alertRoutes');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure AWS SDK
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1'
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'AWS Pricing Tool API is running' });
});

// API routes
app.use('/api', instanceRoutes);
app.use('/api', alertRoutes);

// Catch-all handler for React app in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;

// Log configuration (without sensitive data)
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
console.log(`AWS Credentials: ${process.env.AWS_ACCESS_KEY_ID ? 'Configured' : 'Not configured'}`);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log(`- Health check: http://localhost:${PORT}/`);
    console.log(`- Regions: http://localhost:${PORT}/api/regions`);
    console.log(`- Instances: http://localhost:${PORT}/api/instances/:region`);
    console.log(`- Price history: http://localhost:${PORT}/api/price-history/:region/:instanceType`);
    console.log(`- Calculate savings: http://localhost:${PORT}/api/calculate-savings`);
    console.log(`- Price alerts: http://localhost:${PORT}/api/price-alerts`);
});
