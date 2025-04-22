/**
 * Tests for the alert controller
 */
const alertController = require('../alertController');
const PriceAlert = require('../../models/PriceAlert');

// Mock PriceAlert model
jest.mock('../../models/PriceAlert', () => {
  return {
    create: jest.fn().mockResolvedValue({
      _id: 'test-id',
      instanceType: 't2.micro',
      region: 'us-east-1',
      os: 'Linux',
      priceType: 'spot',
      threshold: 0.0035,
      email: 'test@example.com',
      active: true
    }),
    find: jest.fn().mockResolvedValue([
      {
        _id: 'test-id',
        instanceType: 't2.micro',
        region: 'us-east-1',
        os: 'Linux',
        priceType: 'spot',
        threshold: 0.0035,
        email: 'test@example.com',
        active: true
      }
    ]),
    findByIdAndUpdate: jest.fn().mockResolvedValue({
      _id: 'test-id',
      instanceType: 't2.micro',
      region: 'us-east-1',
      os: 'Linux',
      priceType: 'spot',
      threshold: 0.0040, // Updated threshold
      email: 'test@example.com',
      active: true
    }),
    findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'test-id' })
  };
});

describe('Alert Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAlert', () => {
    beforeEach(() => {
      req.body = {
        instanceType: 't2.micro',
        region: 'us-east-1',
        os: 'Linux',
        priceType: 'spot',
        threshold: 0.0035,
        email: 'test@example.com'
      };
    });

    it('should return 400 for missing fields', async () => {
      req.body = {};
      
      await alertController.createAlert(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    it('should return 400 for invalid email', async () => {
      req.body.email = 'invalid-email';
      
      await alertController.createAlert(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email format' });
    });

    it('should create a new price alert', async () => {
      await alertController.createAlert(req, res);
      
      expect(PriceAlert.create).toHaveBeenCalledWith({
        instanceType: 't2.micro',
        region: 'us-east-1',
        os: 'Linux',
        priceType: 'spot',
        threshold: 0.0035,
        email: 'test@example.com',
        active: true
      });
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAlerts', () => {
    beforeEach(() => {
      req.query = {
        email: 'test@example.com'
      };
    });

    it('should return 400 if email is not provided', async () => {
      req.query = {};
      
      await alertController.getAlerts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email is required' });
    });

    it('should return alerts for the specified email', async () => {
      await alertController.getAlerts(req, res);
      
      expect(PriceAlert.find).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.json).toHaveBeenCalled();
      
      const alerts = res.json.mock.calls[0][0];
      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('updateAlert', () => {
    beforeEach(() => {
      req.params = {
        id: 'test-id'
      };
      req.body = {
        threshold: 0.0040,
        active: true
      };
    });

    it('should update a price alert', async () => {
      await alertController.updateAlert(req, res);
      
      expect(PriceAlert.findByIdAndUpdate).toHaveBeenCalledWith('test-id', {
        threshold: 0.0040,
        active: true
      });
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('deleteAlert', () => {
    beforeEach(() => {
      req.params = {
        id: 'test-id'
      };
    });

    it('should delete a price alert', async () => {
      await alertController.deleteAlert(req, res);
      
      expect(PriceAlert.findByIdAndDelete).toHaveBeenCalledWith('test-id');
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
