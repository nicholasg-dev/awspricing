/**
 * AWS helper functions
 */
const AWS = require('aws-sdk');

// AWS Regions mapping
const AWS_REGIONS = {
  'us-east-1': 'US East (N. Virginia)',
  'us-east-2': 'US East (Ohio)',
  'us-west-1': 'US West (N. California)',
  'us-west-2': 'US West (Oregon)',
  'eu-west-1': 'EU (Ireland)',
  'eu-central-1': 'EU (Frankfurt)',
  'ap-southeast-1': 'Asia Pacific (Singapore)',
  'ap-southeast-2': 'Asia Pacific (Sydney)',
  'ap-northeast-1': 'Asia Pacific (Tokyo)',
  'sa-east-1': 'South America (São Paulo)'
};

/**
 * Get AWS Pricing API instance
 * @returns {AWS.Pricing} AWS Pricing API instance
 */
function getPricingAPI() {
  return new AWS.Pricing({ region: 'us-east-1' }); // Pricing API is only available in us-east-1
}

/**
 * Get EC2 API instance for a specific region
 * @param {string} region - AWS region ID
 * @returns {AWS.EC2} AWS EC2 API instance
 */
function getEC2API(region) {
  return new AWS.EC2({ region });
}

/**
 * Get region name from region ID
 * @param {string} regionId - AWS region ID
 * @returns {string} AWS region name
 */
function getRegionName(regionId) {
  return AWS_REGIONS[regionId] || 'Unknown Region';
}

/**
 * Get all available regions
 * @returns {Array} Array of region objects with id and name
 */
function getAllRegions() {
  return Object.entries(AWS_REGIONS).map(([id, name]) => ({ id, name }));
}

/**
 * Validate region ID
 * @param {string} regionId - AWS region ID
 * @returns {boolean} Whether the region ID is valid
 */
function isValidRegion(regionId) {
  return Object.keys(AWS_REGIONS).includes(regionId);
}

module.exports = {
  AWS_REGIONS,
  getPricingAPI,
  getEC2API,
  getRegionName,
  getAllRegions,
  isValidRegion
};
