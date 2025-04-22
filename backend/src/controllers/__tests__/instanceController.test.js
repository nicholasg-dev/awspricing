/**
 * Tests for the instance controller
 */
const instanceController = require('../instanceController');
const PriceHistory = require('../../models/PriceHistory');
const AWS = require('aws-sdk');

// Mock AWS SDK
jest.mock('aws-sdk', () => {
  const mockPricing = {
    getProducts: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({
      PriceList: [
        JSON.stringify({
          attributes: {
            servicecode: 'AmazonEC2',
            instanceType: 't2.micro',
            vcpu: '1',
            memory: '1 GiB',
            networkPerformance: 'Low to Moderate',
            operatingSystem: 'Linux'
          },
          terms: {
            OnDemand: {
              'test1': {
                priceDimensions: {
                  'test2': {
                    pricePerUnit: {
                      USD: '0.0116'
                    }
                  }
                }
              }
            },
            Reserved: {
              'test3': {
                termAttributes: {
                  LeaseContractLength: '1yr',
                  PurchaseOption: 'No Upfront'
                },
                priceDimensions: {
                  'test4': {
                    pricePerUnit: {
                      USD: '0.0080'
                    }
                  }
                }
              }
            }
          }
        })
      ]
    })
  };

  const mockEC2 = {
    describeSpotPriceHistory: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({
      SpotPriceHistory: [
        {
          InstanceType: 't2.micro',
          SpotPrice: '0.0035',
          Timestamp: new Date().toISOString()
        }
      ]
    })
  };

  return {
    Pricing: jest.fn(() => mockPricing),
    EC2: jest.fn(() => mockEC2)
  };
});

// Mock PriceHistory model
jest.mock('../../models/PriceHistory', () => {
  return {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue([]),
    insertMany: jest.fn().mockResolvedValue([])
  };
});

describe('Instance Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRegions', () => {
    it('should return a list of regions', () => {
      instanceController.getRegions(req, res);
      
      expect(res.json).toHaveBeenCalled();
      const regions = res.json.mock.calls[0][0];
      expect(Array.isArray(regions)).toBe(true);
      expect(regions.length).toBeGreaterThan(0);
      expect(regions[0]).toHaveProperty('id');
      expect(regions[0]).toHaveProperty('name');
    });
  });

  describe('getPriceHistory', () => {
    beforeEach(() => {
      req.params = {
        region: 'us-east-1',
        instanceType: 't2.micro'
      };
      req.query = {
        days: '7',
        os: 'Linux'
      };
    });

    it('should return 400 for invalid region', async () => {
      req.params.region = 'invalid-region';
      
      await instanceController.getPriceHistory(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid region' });
    });

    it('should fetch price history from database', async () => {
      await instanceController.getPriceHistory(req, res);
      
      expect(PriceHistory.find).toHaveBeenCalled();
      expect(PriceHistory.sort).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should generate initial data if no history found', async () => {
      // Mock AWS SDK to return data for initial history generation
      AWS.Pricing().getProducts().promise.mockResolvedValueOnce({
        PriceList: [
          JSON.stringify({
            attributes: {
              servicecode: 'AmazonEC2',
              instanceType: 't2.micro',
              vcpu: '1',
              memory: '1 GiB',
              networkPerformance: 'Low to Moderate',
              operatingSystem: 'Linux'
            },
            terms: {
              OnDemand: {
                'test1': {
                  priceDimensions: {
                    'test2': {
                      pricePerUnit: {
                        USD: '0.0116'
                      }
                    }
                  }
                }
              }
            }
          })
        ]
      });

      await instanceController.getPriceHistory(req, res);
      
      // Should try to insert initial data
      expect(PriceHistory.insertMany).toHaveBeenCalled();
    });
  });

  describe('calculateSavings', () => {
    beforeEach(() => {
      req.body = {
        instanceType: 't2.micro',
        region: 'us-east-1',
        os: 'Linux',
        hours: 730, // Hours in a month
        riTerm: '1yr',
        riPayment: 'no_upfront'
      };
    });

    it('should return 400 for missing parameters', async () => {
      req.body = {};
      
      await instanceController.calculateSavings(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required parameters' });
    });

    it('should calculate savings between pricing models', async () => {
      await instanceController.calculateSavings(req, res);
      
      expect(res.json).toHaveBeenCalled();
      const result = res.json.mock.calls[0][0];
      
      expect(result).toHaveProperty('onDemandHourly');
      expect(result).toHaveProperty('reservedHourly');
      expect(result).toHaveProperty('spotHourly');
      expect(result).toHaveProperty('reservedSavings');
      expect(result).toHaveProperty('spotSavings');
    });
  });
});
