/**
 * Scheduler utility for periodic tasks
 *
 * This module handles scheduled tasks using node-cron.
 */
const cron = require('node-cron');
const AWS = require('aws-sdk');
const PriceHistory = require('../models/PriceHistory');
const PriceAlert = require('../models/PriceAlert');
const nodemailer = require('nodemailer');

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

// Common instance types to track
const COMMON_INSTANCE_TYPES = [
  't2.micro', 't2.small', 't2.medium',
  't3.micro', 't3.small', 't3.medium',
  'm5.large', 'm5.xlarge', 'm5.2xlarge',
  'c5.large', 'c5.xlarge', 'c5.2xlarge',
  'r5.large', 'r5.xlarge', 'r5.2xlarge'
];

/**
 * Get EC2 API instance for a specific region
 * @param {string} region - AWS region ID
 * @returns {AWS.EC2} AWS EC2 API instance
 */
function getEC2API(region) {
  return new AWS.EC2({ region });
}

/**
 * Fetch Spot prices for a specific region and OS
 * @param {string} region - AWS region ID
 * @param {string} os - Operating system (Linux/Windows)
 * @returns {Promise<Object>} Spot pricing data
 */
async function fetchSpotPrices(region, os) {
  const ec2 = getEC2API(region);
  const osName = os === 'Linux' ? 'Linux/UNIX' : 'Windows';

  try {
    const data = await ec2.describeSpotPriceHistory({
      ProductDescriptions: [osName],
      StartTime: new Date(),
      MaxResults: 100
    }).promise();

    const spotMap = {};
    data.SpotPriceHistory.forEach(entry => {
      if (!spotMap[entry.InstanceType] ||
          new Date(entry.Timestamp) > new Date(spotMap[entry.InstanceType].timestamp)) {
        spotMap[entry.InstanceType] = {
          price: parseFloat(entry.SpotPrice),
          timestamp: entry.Timestamp
        };
      }
    });
    return spotMap;
  } catch (error) {
    console.error(`Error fetching Spot prices for ${region} ${os}:`, error);
    return {};
  }
}

/**
 * Update price history for common instance types
 */
async function updatePriceHistory() {
  console.log('Running scheduled price history update...');

  try {
    const timestamp = new Date();
    const priceUpdates = [];

    // Process each region
    for (const region of Object.keys(AWS_REGIONS)) {
      console.log(`Updating prices for region: ${region}`);

      // Process each OS type
      for (const os of ['Linux', 'Windows']) {
        // Fetch spot prices
        const spotPrices = await fetchSpotPrices(region, os);

        // Update price history for common instance types
        for (const instanceType of COMMON_INSTANCE_TYPES) {
          if (spotPrices[instanceType]) {
            const price = spotPrices[instanceType].price;

            // Create price history record
            priceUpdates.push({
              instanceType,
              region,
              os,
              priceType: 'spot',
              price,
              timestamp
            });

            // Check for price alerts
            await checkPriceAlerts(instanceType, region, os, 'spot', price);
          }
        }
      }
    }

    // Save all price updates to database
    if (priceUpdates.length > 0) {
      await PriceHistory.insertMany(priceUpdates);
      console.log(`Updated ${priceUpdates.length} price points`);
    } else {
      console.log('No price updates to save');
    }
  } catch (error) {
    console.error('Error updating price history:', error);
  }
}

/**
 * Check for price alerts and send notifications
 * @param {string} instanceType - EC2 instance type
 * @param {string} region - AWS region ID
 * @param {string} os - Operating system (Linux/Windows)
 * @param {string} priceType - Price type (onDemand/reserved/spot)
 * @param {number} currentPrice - Current price
 */
async function checkPriceAlerts(instanceType, region, os, priceType, currentPrice) {
  try {
    // Find alerts that should be triggered
    const alerts = await PriceAlert.find({
      instanceType,
      region,
      os,
      priceType,
      active: true,
      threshold: { $gte: currentPrice }
    });

    if (alerts.length === 0) return;

    console.log(`Found ${alerts.length} alerts to trigger for ${instanceType} in ${region}`);

    // Create email transporter if needed
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Send notifications for each alert
      for (const alert of alerts) {
        // Check if we've already notified recently (avoid spam)
        const lastNotified = alert.lastNotified ? new Date(alert.lastNotified) : null;
        const hoursSinceLastNotification = lastNotified ?
          (new Date() - lastNotified) / (1000 * 60 * 60) : 24;

        // Only send notification if it's been at least 12 hours since the last one
        if (!lastNotified || hoursSinceLastNotification >= 12) {
          const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to: alert.email,
            subject: `AWS Price Alert: ${instanceType} price is now $${currentPrice.toFixed(4)}`,
            html: `
              <h2>AWS EC2 Price Alert</h2>
              <p>Good news! The price for your watched instance has dropped below your threshold.</p>
              <ul>
                <li><strong>Instance Type:</strong> ${instanceType}</li>
                <li><strong>Region:</strong> ${region} (${AWS_REGIONS[region]})</li>
                <li><strong>OS:</strong> ${os}</li>
                <li><strong>Price Type:</strong> ${priceType}</li>
                <li><strong>Current Price:</strong> $${currentPrice.toFixed(4)} per hour</li>
                <li><strong>Your Threshold:</strong> $${alert.threshold.toFixed(4)} per hour</li>
              </ul>
              <p>This is notification #${alert.notificationCount + 1} for this alert.</p>
            `
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Sent price alert email to ${alert.email}`);

            // Update alert with notification info
            await PriceAlert.findByIdAndUpdate(alert._id, {
              lastNotified: new Date(),
              notificationCount: (alert.notificationCount || 0) + 1
            });
          } catch (emailError) {
            console.error('Error sending price alert email:', emailError);
          }
        }
      }
    } else {
      console.log('Email configuration not found. Skipping alert notifications.');
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
}

/**
 * Initialize scheduled tasks
 */
function initScheduledTasks() {
  // Update price history on schedule (default: every 6 hours)
  const priceUpdateSchedule = process.env.PRICE_UPDATE_SCHEDULE || '0 */6 * * *';
  cron.schedule(priceUpdateSchedule, updatePriceHistory);

  console.log(`Price history updates scheduled: ${priceUpdateSchedule}`);

  // Run an initial update
  console.log('Running initial price history update...');
  updatePriceHistory();

  console.log('Scheduled tasks initialized');
}

module.exports = {
  initScheduledTasks,
  updatePriceHistory
};
