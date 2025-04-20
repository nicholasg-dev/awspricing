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

/**
 * @route   GET /api/instance-specs/:instanceType
 * @desc    Get detailed specifications for a specific instance type
 * @access  Public
 */
router.get('/instance-specs/:instanceType', instanceController.getInstanceSpecs);

/**
 * @route   GET /api/reserved-terms
 * @desc    Get available reserved instance terms and payment options
 * @access  Public
 */
router.get('/reserved-terms', instanceController.getReservedTerms);

/**
 * @route   GET /api/export/:region
 * @desc    Export instance data as CSV or JSON
 * @access  Public
 */
router.get('/export/:region', instanceController.exportData);

module.exports = router;
