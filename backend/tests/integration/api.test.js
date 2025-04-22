/**
 * API Integration Tests
 * 
 * These tests verify that the API endpoints work correctly.
 */
const request = require('supertest');
const path = require('path');
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Mock AWS SDK before importing server
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
    EC2: jest.fn(() => mockEC2),
    config: {
      update: jest.fn()
    }
  };
});

// Mock node-cron to prevent scheduled tasks from running during tests
jest.mock('node-cron', () => ({
  schedule: jest.fn()
}));

// Import server after mocking dependencies
const app = require('../../server');

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return 200 OK for the health check endpoint', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'AWS Pricing Tool API is running');
    });
  });

  describe('Regions API', () => {
    it('should return a list of regions', async () => {
      const response = await request(app).get('/api/regions');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('Price Alerts API', () => {
    it('should create a new price alert', async () => {
      const alertData = {
        instanceType: 't2.micro',
        region: 'us-east-1',
        os: 'Linux',
        priceType: 'spot',
        threshold: 0.0035,
        email: 'test@example.com'
      };
      
      const response = await request(app)
        .post('/api/price-alerts')
        .send(alertData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('instanceType', 't2.micro');
      expect(response.body).toHaveProperty('email', 'test@example.com');
    });

    it('should return 400 for invalid alert data', async () => {
      const invalidData = {
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/price-alerts')
        .send(invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Savings Calculator API', () => {
    it('should calculate savings between pricing models', async () => {
      const calculationData = {
        instanceType: 't2.micro',
        region: 'us-east-1',
        os: 'Linux',
        hours: 730 // Hours in a month
      };
      
      const response = await request(app)
        .post('/api/calculate-savings')
        .send(calculationData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('onDemandHourly');
      expect(response.body).toHaveProperty('reservedHourly');
      expect(response.body).toHaveProperty('spotHourly');
      expect(response.body).toHaveProperty('reservedSavings');
      expect(response.body).toHaveProperty('spotSavings');
    });
  });
});
