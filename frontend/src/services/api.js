/**
 * API service for the AWS Pricing Tool
 * Handles all API calls to the backend
 */

const API_BASE_URL = 'http://localhost:4000/api';

/**
 * Fetch available AWS regions
 * @returns {Promise<Array>} List of AWS regions
 */
export const fetchRegions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/regions`);
    if (!response.ok) {
      throw new Error('Failed to fetch regions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching regions:', error);
    throw error;
  }
};

/**
 * Fetch EC2 instance pricing data for a specific region
 * @param {string} region - AWS region ID
 * @returns {Promise<Array>} List of EC2 instances with pricing data
 */
export const fetchInstances = async (region) => {
  try {
    const response = await fetch(`${API_BASE_URL}/instances/${region}`);
    if (!response.ok) {
      throw new Error('Failed to fetch instance data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching instances:', error);
    throw error;
  }
};

/**
 * Fetch price history for a specific instance type
 * @param {string} region - AWS region ID
 * @param {string} instanceType - EC2 instance type
 * @returns {Promise<Array>} Price history data
 */
export const fetchPriceHistory = async (region, instanceType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/price-history/${region}/${instanceType}`);
    if (!response.ok) {
      throw new Error('Failed to fetch price history');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
};

/**
 * Calculate savings between different pricing models
 * @param {Object} params - Calculation parameters
 * @param {string} params.instanceType - EC2 instance type
 * @param {string} params.region - AWS region ID
 * @param {string} params.os - Operating system (Linux/Windows)
 * @param {number} params.hours - Number of hours
 * @param {string} params.riTerm - Reserved instance term (1yr/3yr)
 * @param {string} params.riPayment - Reserved instance payment option
 * @returns {Promise<Object>} Savings calculation results
 */
export const calculateSavings = async (params) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculate-savings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error('Failed to calculate savings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error calculating savings:', error);
    throw error;
  }
};

/**
 * Create a new price alert
 * @param {Object} alert - Alert parameters
 * @param {string} alert.instanceType - EC2 instance type
 * @param {string} alert.region - AWS region ID
 * @param {string} alert.os - Operating system (Linux/Windows)
 * @param {string} alert.priceType - Price type (onDemand/reserved/spot)
 * @param {number} alert.threshold - Price threshold
 * @param {string} alert.email - Email address for notifications
 * @returns {Promise<Object>} Created alert
 */
export const createPriceAlert = async (alert) => {
  try {
    const response = await fetch(`${API_BASE_URL}/price-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...alert,
        active: true,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create price alert');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating price alert:', error);
    throw error;
  }
};

export default {
  fetchRegions,
  fetchInstances,
  fetchPriceHistory,
  calculateSavings,
  createPriceAlert,
};
