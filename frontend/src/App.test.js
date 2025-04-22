import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock data
const mockRegions = [
  { id: 'us-east-1', name: 'US East (N. Virginia)' },
  { id: 'us-west-2', name: 'US West (Oregon)' }
];

const mockInstances = [
  {
    id: 0,
    instanceType: 't2.micro',
    vCPU: 1,
    memoryGiB: 1,
    networkPerformance: 'Low to Moderate',
    os: 'Linux',
    onDemand: 0.0116,
    reserved: 0.0080,
    spot: 0.0035,
    spotLastUpdated: '2023-04-01T00:00:00.000Z'
  }
];

// Mock fetch responses
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Mock fetch for regions
  global.fetch = jest.fn()
    .mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockRegions)
    }))
    // Mock fetch for instances
    .mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockInstances)
    }));
});

// Mock Material UI components that might cause issues
jest.mock('@mui/material/Drawer', () => {
  return ({ children, open, onClose, variant }) => (
    <div data-testid="mock-drawer" data-open={open} data-variant={variant}>
      {children}
    </div>
  );
});

describe('App Component', () => {
  it('renders the app header', async () => {
    render(<App />);
    
    // Check for header
    expect(screen.getByText('AWS EC2 Instance Pricing')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('loads regions and instances on mount', async () => {
    render(<App />);
    
    // Wait for regions to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/api/regions');
    });
    
    // Wait for instances to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/api/instances/us-east-1');
    });
  });

  it('displays error when fetch fails', async () => {
    // Mock fetch to fail
    global.fetch.mockReset();
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch')));
    
    render(<App />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch regions')).toBeInTheDocument();
    });
  });

  it('renders the data grid when data is loaded', async () => {
    render(<App />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
    
    // Check for data grid (this is a simplified check since the actual DataGrid is complex)
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });
});
