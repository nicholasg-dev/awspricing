/**
 * Routes for price alert-related endpoints
 */
const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

/**
 * @route   POST /api/price-alerts
 * @desc    Create a new price alert
 * @access  Public
 */
router.post('/price-alerts', alertController.createAlert);

/**
 * @route   GET /api/price-alerts
 * @desc    Get all price alerts for a user
 * @access  Public
 */
router.get('/price-alerts', alertController.getAlerts);

/**
 * @route   PUT /api/price-alerts/:id
 * @desc    Update a price alert
 * @access  Public
 */
router.put('/price-alerts/:id', alertController.updateAlert);

/**
 * @route   DELETE /api/price-alerts/:id
 * @desc    Delete a price alert
 * @access  Public
 */
router.delete('/price-alerts/:id', alertController.deleteAlert);

module.exports = router;
