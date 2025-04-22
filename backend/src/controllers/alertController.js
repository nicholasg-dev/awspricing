/**
 * Controller for price alert-related endpoints
 */
const PriceAlert = require('../models/PriceAlert');

/**
 * Create a new price alert
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createAlert = async (req, res) => {
  const {
    instanceType,
    region,
    os,
    priceType,
    threshold,
    email
  } = req.body;

  // Validate required fields
  if (!instanceType || !region || !os || !priceType || !threshold || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const alert = await PriceAlert.create({
      instanceType,
      region,
      os,
      priceType,
      threshold: parseFloat(threshold),
      email,
      active: true
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({ error: 'Failed to create price alert' });
  }
};

/**
 * Get all price alerts for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAlerts = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const alerts = await PriceAlert.find({ email });
    res.json(alerts);
  } catch (error) {
    console.error('Error getting price alerts:', error);
    res.status(500).json({ error: 'Failed to get price alerts' });
  }
};

/**
 * Update a price alert
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateAlert = async (req, res) => {
  const { id } = req.params;
  const { threshold, active } = req.body;

  try {
    const alert = await PriceAlert.update(id, {
      threshold: threshold !== undefined ? parseFloat(threshold) : undefined,
      active: active !== undefined ? active : undefined
    });

    res.json(alert);
  } catch (error) {
    console.error('Error updating price alert:', error);
    res.status(500).json({ error: 'Failed to update price alert' });
  }
};

/**
 * Delete a price alert
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteAlert = async (req, res) => {
  const { id } = req.params;

  try {
    await PriceAlert.delete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    res.status(500).json({ error: 'Failed to delete price alert' });
  }
};
