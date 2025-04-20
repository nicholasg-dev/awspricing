/**
 * Utility functions for formatting data in the AWS Pricing Tool
 */

/**
 * Format a price value to a currency string
 * @param {number} price - Price value
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, decimals = 4) => {
  if (price === null || price === undefined) return 'N/A';
  return `$${price.toFixed(decimals)}`;
};

/**
 * Format a price as hourly, monthly, and yearly
 * @param {number} hourlyPrice - Hourly price
 * @returns {Object} Object with hourly, monthly, and yearly prices
 */
export const formatPriceBreakdown = (hourlyPrice) => {
  if (hourlyPrice === null || hourlyPrice === undefined) {
    return {
      hourly: 'N/A',
      monthly: 'N/A',
      yearly: 'N/A',
    };
  }
  
  const monthly = hourlyPrice * 730; // Average hours in a month
  const yearly = monthly * 12;
  
  return {
    hourly: formatPrice(hourlyPrice),
    monthly: formatPrice(monthly, 2),
    yearly: formatPrice(yearly, 2),
  };
};

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

/**
 * Format a percentage value
 * @param {number} value - Percentage value
 * @param {boolean} includeSign - Whether to include a + sign for positive values
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, includeSign = true) => {
  if (value === null || value === undefined) return 'N/A';
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

/**
 * Calculate percentage difference between two values
 * @param {number} value1 - First value
 * @param {number} value2 - Second value
 * @returns {number} Percentage difference
 */
export const calculatePercentageDifference = (value1, value2) => {
  if (!value1 || !value2) return null;
  return ((value2 - value1) / value1) * 100;
};

/**
 * Format memory size (GiB)
 * @param {number} memory - Memory size in GiB
 * @returns {string} Formatted memory string
 */
export const formatMemory = (memory) => {
  if (!memory) return 'N/A';
  return `${memory} GiB`;
};

export default {
  formatPrice,
  formatPriceBreakdown,
  formatDate,
  formatPercentage,
  calculatePercentageDifference,
  formatMemory,
};
