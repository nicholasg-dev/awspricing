/**
 * Price Alert model
 *
 * This model stores price alert configurations for EC2 instances.
 */
const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  instanceType: {
    type: String,
    required: true,
    index: true
  },
  region: {
    type: String,
    required: true,
    index: true
  },
  os: {
    type: String,
    required: true,
    enum: ['Linux', 'Windows']
  },
  priceType: {
    type: String,
    required: true,
    enum: ['onDemand', 'reserved', 'spot']
  },
  threshold: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  active: {
    type: Boolean,
    default: true
  },
  lastNotified: {
    type: Date,
    default: null
  },
  notificationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create a compound index for efficient queries
priceAlertSchema.index({ instanceType: 1, region: 1, priceType: 1, active: 1 });

/**
 * Static method to create a new price alert
 * @param {Object} alertData - Alert data
 * @returns {Promise<Object>} Created alert
 */
priceAlertSchema.statics.create = async function(alertData) {
  return this.create(alertData);
};

/**
 * Static method to find all active price alerts
 * @returns {Promise<Array>} List of active alerts
 */
priceAlertSchema.statics.findActive = async function() {
  return this.find({ active: true }).lean();
};

/**
 * Static method to update a price alert
 * @param {string} id - Alert ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated alert
 */
priceAlertSchema.statics.update = async function(id, updateData) {
  return this.findByIdAndUpdate(id, updateData, { new: true }).lean();
};

/**
 * Static method to delete a price alert
 * @param {string} id - Alert ID
 * @returns {Promise<boolean>} Whether the alert was deleted
 */
priceAlertSchema.statics.delete = async function(id) {
  const result = await this.findByIdAndDelete(id);
  return !!result;
};

/**
 * Static method to find alerts for a specific instance type and price
 * @param {string} instanceType - EC2 instance type
 * @param {string} region - AWS region ID
 * @param {string} priceType - Price type (onDemand/reserved/spot)
 * @param {number} currentPrice - Current price
 * @returns {Promise<Array>} List of triggered alerts
 */
priceAlertSchema.statics.findTriggeredAlerts = async function(instanceType, region, priceType, currentPrice) {
  return this.find({
    instanceType,
    region,
    priceType,
    active: true,
    threshold: { $gte: currentPrice }
  }).lean();
};

const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);

module.exports = PriceAlert;
