/**
 * Controller for EC2 instance-related endpoints
 */
const AWS = require('aws-sdk');

// Cache structure: { [region]: { data: null, timestamp: 0 } }
let cache = {};
const CACHE_TTL = 60 * 10 * 1000; // 10 minutes

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
 * Fetch EC2 prices (On-Demand and Reserved) for a specific region and OS
 * @param {string} region - AWS region ID
 * @param {string} os - Operating system (Linux/Windows)
 * @returns {Promise<Object>} EC2 pricing data
 */
async function fetchEC2Prices(region, os) {
  const pricing = getPricingAPI();

  // Filter for EC2 instances in the specified region with the specified OS
  const params = {
    ServiceCode: 'AmazonEC2',
    Filters: [
      {
        Type: 'TERM_MATCH',
        Field: 'location',
        Value: AWS_REGIONS[region]
      },
      {
        Type: 'TERM_MATCH',
        Field: 'operatingSystem',
        Value: os
      },
      {
        Type: 'TERM_MATCH',
        Field: 'tenancy',
        Value: 'Shared'
      },
      {
        Type: 'TERM_MATCH',
        Field: 'capacitystatus',
        Value: 'Used'
      }
    ]
  };

  try {
    // Get all products matching the filters
    const products = await pricing.getProducts(params).promise();

    // Process the products to extract pricing information
    const instances = [];

    for (const product of Object.values(products.PriceList)) {
      const productData = JSON.parse(product);
      const { attributes, terms } = productData;

      // Skip if not an EC2 instance
      if (attributes.servicecode !== 'AmazonEC2') continue;

      // Extract instance details
      const instanceType = attributes.instanceType;
      const vCPU = attributes.vcpu;
      const memory = attributes.memory;
      const networkPerformance = attributes.networkPerformance;

      // Extract pricing information
      let onDemandPrice = null;
      let reservedPrice = null;

      // On-Demand pricing
      if (terms.OnDemand) {
        const onDemandTerm = Object.values(terms.OnDemand)[0];
        const priceDimension = Object.values(onDemandTerm.priceDimensions)[0];
        onDemandPrice = parseFloat(priceDimension.pricePerUnit.USD);
      }

      // Reserved pricing (1 year, no upfront)
      if (terms.Reserved) {
        const reservedTerms = Object.values(terms.Reserved);
        for (const term of reservedTerms) {
          if (term.termAttributes.LeaseContractLength === '1yr' &&
              term.termAttributes.PurchaseOption === 'No Upfront') {
            const priceDimension = Object.values(term.priceDimensions)[0];
            reservedPrice = parseFloat(priceDimension.pricePerUnit.USD);
            break;
          }
        }
      }

      instances.push({
        instanceType,
        vCPU: parseInt(vCPU),
        memoryGiB: parseFloat(memory.replace(' GiB', '')),
        networkPerformance,
        os,
        onDemand: onDemandPrice,
        reserved: reservedPrice
      });
    }

    return instances;
  } catch (error) {
    console.error('Error fetching EC2 prices:', error);
    throw error;
  }
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
    console.error('Error fetching Spot prices:', error);
    throw error;
  }
}

/**
 * Get list of available AWS regions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRegions = (req, res) => {
  try {
    const regions = Object.entries(AWS_REGIONS).map(([id, name]) => ({ id, name }));
    res.json(regions);
  } catch (error) {
    console.error('Error getting regions:', error);
    res.status(500).json({ error: 'Failed to get regions' });
  }
};

/**
 * Get EC2 instance pricing data for a specific region
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getInstances = async (req, res) => {
  const { region } = req.params;

  if (!AWS_REGIONS[region]) {
    return res.status(400).json({ error: 'Invalid region' });
  }

  try {
    // Check cache
    if (cache[region] && Date.now() - cache[region].timestamp < CACHE_TTL) {
      return res.json(cache[region].data);
    }

    let allInstances = [];
    for (const os of ['Linux', 'Windows']) {
      const ondemandReserved = await fetchEC2Prices(region, os);
      const spotPrices = await fetchSpotPrices(region, os);

      ondemandReserved.forEach(instance => {
        const { instanceType } = instance;
        allInstances.push({
          ...instance,
          spot: spotPrices[instanceType]?.price || null,
          spotLastUpdated: spotPrices[instanceType]?.timestamp || null
        });
      });
    }

    // Update cache
    cache[region] = {
      data: allInstances,
      timestamp: Date.now()
    };

    res.json(allInstances);
  } catch (error) {
    console.error('Error getting instances:', error);
    res.status(500).json({ error: 'Failed to fetch pricing data' });
  }
};

/**
 * Get price history for a specific instance type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPriceHistory = async (req, res) => {
  const { region, instanceType } = req.params;

  if (!AWS_REGIONS[region]) {
    return res.status(400).json({ error: 'Invalid region' });
  }

  try {
    // In a real application, this would fetch from a database
    // For now, we'll generate mock data
    const now = new Date();
    const history = [];

    // Generate 30 days of mock data
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate random prices with some variation
      const onDemandPrice = 0.1 + (Math.random() * 0.02 - 0.01);
      const spotPrice = onDemandPrice * (0.3 + Math.random() * 0.1);

      history.push({
        timestamp: date.toISOString(),
        instanceType,
        region,
        priceType: 'onDemand',
        price: onDemandPrice
      });

      history.push({
        timestamp: date.toISOString(),
        instanceType,
        region,
        priceType: 'spot',
        price: spotPrice
      });
    }

    res.json(history);
  } catch (error) {
    console.error('Error getting price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
};

/**
 * Calculate savings between different pricing models
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.calculateSavings = (req, res) => {
  const {
    instanceType,
    region,
    os,
    hours,
    riTerm = '1yr',
    riPayment = 'no_upfront'
  } = req.body;

  if (!instanceType || !region || !os || !hours) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // This is a simplified calculation
    // In a real application, you would fetch actual pricing data

    // Mock data for demonstration
    const mockPrices = {
      onDemand: 0.10,
      spot: 0.03,
      reserved: {
        '1yr': {
          'no_upfront': 0.07,
          'partial_upfront': { hourly: 0.04, upfront: 100 },
          'all_upfront': { hourly: 0, upfront: 700 }
        },
        '3yr': {
          'no_upfront': 0.05,
          'partial_upfront': { hourly: 0.03, upfront: 200 },
          'all_upfront': { hourly: 0, upfront: 1500 }
        }
      }
    };

    // Calculate total costs
    const onDemandHourly = mockPrices.onDemand;
    const onDemandMonthly = onDemandHourly * hours;

    const spotHourly = mockPrices.spot;
    const spotMonthly = spotHourly * hours;

    let reservedHourly, riUpfront;
    if (typeof mockPrices.reserved[riTerm][riPayment] === 'object') {
      reservedHourly = mockPrices.reserved[riTerm][riPayment].hourly;
      riUpfront = mockPrices.reserved[riTerm][riPayment].upfront;
    } else {
      reservedHourly = mockPrices.reserved[riTerm][riPayment];
      riUpfront = 0;
    }

    const reservedMonthly = (reservedHourly * hours) + (riUpfront / 12); // Amortize upfront cost over 12 months

    // Calculate savings
    const reservedSavings = onDemandMonthly - reservedMonthly;
    const reservedSavingsPercentage = (reservedSavings / onDemandMonthly) * 100;

    const spotSavings = onDemandMonthly - spotMonthly;
    const spotSavingsPercentage = (spotSavings / onDemandMonthly) * 100;

    res.json({
      instanceType,
      region,
      os,
      hours,
      riTerm,
      riPayment,
      onDemandHourly,
      onDemandMonthly,
      reservedHourly,
      reservedMonthly,
      spotHourly,
      spotMonthly,
      reservedSavings,
      reservedSavingsPercentage,
      spotSavings,
      spotSavingsPercentage
    });
  } catch (error) {
    console.error('Error calculating savings:', error);
    res.status(500).json({ error: 'Failed to calculate savings' });
  }
};

// Enhanced instance specifications
const INSTANCE_SPECS = {
  't2.micro': {
    processorInfo: 'Intel Xeon Family',
    maxBandwidth: 'Low to Moderate',
    ebs: 'EBS-Only',
    networkPerformance: 'Low to Moderate',
    maxEbsBandwidth: 'Moderate',
    clockSpeed: 'Up to 3.3 GHz',
    burstablePerformance: true,
    dedicatedEbsBandwidth: false
  },
  't3.micro': {
    processorInfo: 'Intel Xeon Platinum 8259CL',
    maxBandwidth: '5 Gbps',
    ebs: 'EBS-Only',
    networkPerformance: 'Up to 5 Gigabit',
    maxEbsBandwidth: '2,085 Mbps',
    clockSpeed: '2.5 GHz',
    burstablePerformance: true,
    dedicatedEbsBandwidth: false
  },
  'm5.large': {
    processorInfo: 'Intel Xeon Platinum 8175M',
    maxBandwidth: '10 Gbps',
    ebs: 'EBS-Only',
    networkPerformance: 'Up to 10 Gigabit',
    maxEbsBandwidth: '4,750 Mbps',
    clockSpeed: '3.1 GHz',
    burstablePerformance: false,
    dedicatedEbsBandwidth: true
  },
  'c5.large': {
    processorInfo: 'Intel Xeon Platinum 8124M',
    maxBandwidth: '10 Gbps',
    ebs: 'EBS-Only',
    networkPerformance: 'Up to 10 Gigabit',
    maxEbsBandwidth: '4,750 Mbps',
    clockSpeed: '3.4 GHz',
    burstablePerformance: false,
    dedicatedEbsBandwidth: true
  },
  'r5.large': {
    processorInfo: 'Intel Xeon Platinum 8175M',
    maxBandwidth: '10 Gbps',
    ebs: 'EBS-Only',
    networkPerformance: 'Up to 10 Gigabit',
    maxEbsBandwidth: '4,750 Mbps',
    clockSpeed: '3.1 GHz',
    burstablePerformance: false,
    dedicatedEbsBandwidth: true
  }
};

// Reserved Instance Terms
const RI_TERMS = {
  '1yr': {
    'no_upfront': { term: '1 year', payment: 'No Upfront', discount: 0.25 },
    'partial_upfront': { term: '1 year', payment: 'Partial Upfront', discount: 0.35 },
    'all_upfront': { term: '1 year', payment: 'All Upfront', discount: 0.40 }
  },
  '3yr': {
    'no_upfront': { term: '3 year', payment: 'No Upfront', discount: 0.45 },
    'partial_upfront': { term: '3 year', payment: 'Partial Upfront', discount: 0.55 },
    'all_upfront': { term: '3 year', payment: 'All Upfront', discount: 0.60 }
  }
};

/**
 * Get detailed specifications for a specific instance type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getInstanceSpecs = (req, res) => {
  const { instanceType } = req.params;

  try {
    const specs = INSTANCE_SPECS[instanceType] || {};
    res.json(specs);
  } catch (error) {
    console.error('Error getting instance specs:', error);
    res.status(500).json({ error: 'Failed to get instance specifications' });
  }
};

/**
 * Get available reserved instance terms and payment options
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getReservedTerms = (req, res) => {
  try {
    res.json(RI_TERMS);
  } catch (error) {
    console.error('Error getting reserved terms:', error);
    res.status(500).json({ error: 'Failed to get reserved instance terms' });
  }
};

/**
 * Export instance data as CSV or JSON
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.exportData = async (req, res) => {
  const { region } = req.params;
  const { format } = req.query;

  if (!AWS_REGIONS[region]) {
    return res.status(400).json({ error: 'Invalid region' });
  }

  try {
    // Check cache or fetch fresh data
    let data;
    if (cache[region] && Date.now() - cache[region].timestamp < CACHE_TTL) {
      data = cache[region].data;
    } else {
      // Fetch data if not in cache
      let allInstances = [];
      for (const os of ['Linux', 'Windows']) {
        const ondemandReserved = await fetchEC2Prices(region, os);
        const spotPrices = await fetchSpotPrices(region, os);

        ondemandReserved.forEach(instance => {
          const { instanceType } = instance;
          allInstances.push({
            ...instance,
            spot: spotPrices[instanceType]?.price || null,
            spotLastUpdated: spotPrices[instanceType]?.timestamp || null
          });
        });
      }

      data = allInstances;

      // Update cache
      cache[region] = {
        data,
        timestamp: Date.now()
      };
    }

    if (format === 'csv') {
      // In a real application, you would use a CSV library
      // For now, we'll just send JSON
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=aws-pricing-${region}.csv`);

      // Simple CSV conversion
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => Object.values(item).join(','));
      const csv = [headers, ...rows].join('\n');

      return res.send(csv);
    }

    res.json(data);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
};
