import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PriceHistory from '../PriceHistory';

// Mock data
const mockHistoryData = [
  {
    instanceType: 't2.micro',
    region: 'us-east-1',
    os: 'Linux',
    priceType: 'onDemand',
    price: 0.0116,
    timestamp: '2023-04-01T00:00:00.000Z'
  },
  {
    instanceType: 't2.micro',
    region: 'us-east-1',
    os: 'Linux',
    priceType: 'spot',
    price: 0.0035,
    timestamp: '2023-04-01T00:00:00.000Z'
  },
  {
    instanceType: 't2.micro',
    region: 'us-east-1',
    os: 'Linux',
    priceType: 'reserved',
    price: 0.0080,
    timestamp: '2023-04-01T00:00:00.000Z'
  }
];

// Reset mocks before each test
beforeEach(() => {
  global.fetch.mockClear();
});

describe('PriceHistory Component', () => {
  it('renders loading state initially', () => {
    render(
      <PriceHistory
        instanceType="t2.micro"
        region="us-east-1"
        os="Linux"
      />
    );
    
    expect(screen.getByText('Price History')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    // Mock fetch to return an error
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    render(
      <PriceHistory
        instanceType="t2.micro"
        region="us-east-1"
        os="Linux"
      />
    );
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load price history data')).toBeInTheDocument();
    });
  });

  it('renders price history data when provided directly', () => {
    render(
      <PriceHistory
        instanceType="t2.micro"
        region="us-east-1"
        os="Linux"
        data={mockHistoryData}
      />
    );
    
    // Check for chart and statistics
    expect(screen.getByText('Price History')).toBeInTheDocument();
    expect(screen.getByText('Price Statistics')).toBeInTheDocument();
    expect(screen.getByText('On-Demand Price')).toBeInTheDocument();
    expect(screen.getByText('Spot Price')).toBeInTheDocument();
    expect(screen.getByText('Reserved Price')).toBeInTheDocument();
  });

  it('fetches price history data when not provided directly', async () => {
    // Mock fetch to return mock data
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockHistoryData)
      })
    );

    render(
      <PriceHistory
        instanceType="t2.micro"
        region="us-east-1"
        os="Linux"
      />
    );
    
    // Check that fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/price-history/us-east-1/t2.micro?days=30&os=Linux'
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Price Statistics')).toBeInTheDocument();
    });
  });

  it('renders empty state when no data is available', async () => {
    // Mock fetch to return empty array
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );

    render(
      <PriceHistory
        instanceType="t2.micro"
        region="us-east-1"
        os="Linux"
      />
    );
    
    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No price history data available for this instance type.')).toBeInTheDocument();
    });
  });
});
