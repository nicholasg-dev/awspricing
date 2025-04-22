/**
 * Price History model
 * 
 * This model stores historical pricing data for EC2 instances.
 */
const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
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
  price: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Create a compound index for efficient queries
priceHistorySchema.index({ instanceType: 1, region: 1, priceType: 1, timestamp: -1 });

/**
 * Static method to get price history for a specific instance type in a region
 * @param {string} instanceType - EC2 instance type
 * @param {string} region - AWS region ID
 * @param {number} days - Number of days of history to retrieve (default: 30)
 * @returns {Promise<Array>} Price history data
 */
priceHistorySchema.statics.getHistory = async function(instanceType, region, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    instanceType,
    region,
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: 1 })
  .lean();
};

/**
 * Static method to record a new price point
 * @param {Object} priceData - Price data object
 * @returns {Promise<Object>} Created price history record
 */
priceHistorySchema.statics.recordPrice = async function(priceData) {
  return this.create(priceData);
};

/**
 * Static method to get the latest price for a specific instance type
 * @param {string} instanceType - EC2 instance type
 * @param {string} region - AWS region ID
 * @param {string} priceType - Price type (onDemand/reserved/spot)
 * @returns {Promise<Object>} Latest price data
 */
priceHistorySchema.statics.getLatestPrice = async function(instanceType, region, priceType) {
  return this.findOne({
    instanceType,
    region,
    priceType
  })
  .sort({ timestamp: -1 })
  .lean();
};

const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);

module.exports = PriceHistory;
