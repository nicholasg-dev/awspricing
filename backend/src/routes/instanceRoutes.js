/**
 * Routes for EC2 instance-related endpoints
 */
const express = require('express');
const router = express.Router();
const instanceController = require('../controllers/instanceController');

/**
 * @route   GET /api/regions
 * @desc    Get list of available AWS regions
 * @access  Public
 */
router.get('/regions', instanceController.getRegions);

/**
 * @route   GET /api/instances/:region
 * @desc    Get EC2 instance pricing data for a specific region
 * @access  Public
 */
router.get('/instances/:region', instanceController.getInstances);

/**
 * @route   GET /api/price-history/:region/:instanceType
 * @desc    Get price history for a specific instance type
 * @access  Public
 */
router.get('/price-history/:region/:instanceType', instanceController.getPriceHistory);

/**
 * @route   POST /api/calculate-savings
 * @desc    Calculate savings between different pricing models
 * @access  Public
 */
router.post('/calculate-savings', instanceController.calculateSavings);

module.exports = router;
