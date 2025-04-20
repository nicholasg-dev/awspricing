# Frontend Components Documentation

This document provides detailed information about the React components used in the AWS EC2 Instance Pricing Tool.

## Main Components

### App.js

The main application component that handles routing, state management, and renders the UI.

**State**
- `rows`: Array of all instance data
- `regions`: Array of available AWS regions
- `selectedRegion`: Currently selected region
- `os`: Selected operating system filter
- `pricing`: Selected pricing type filter
- `filteredRows`: Filtered instance data
- `loading`: Loading state
- `error`: Error state
- `activeTab`: Currently active tab
- `selectedInstances`: Array of selected instances for comparison

**Functions**
- `handleTabChange`: Handles tab selection
- `handleInstanceSelection`: Handles instance selection for comparison

**Rendering**
- Renders the main application layout with tabs
- Conditionally renders different components based on the active tab

## Enhanced Components

### PriceHistory

Displays historical pricing data for EC2 instances using Chart.js.

**Props**
- `instanceType`: EC2 instance type
- `region`: AWS region ID
- `data`: (Optional) Price history data

**State**
- `historyData`: Array of price history data
- `loading`: Loading state
- `error`: Error state

**Functions**
- Fetches price history data from the API
- Formats data for Chart.js

**Rendering**
- Renders a line chart showing price history
- Shows loading indicator while fetching data
- Shows error message if data fetch fails
- Shows info message if no data is available

### SavingsCalculator

Calculates potential savings between different pricing models.

**Props**
- `instanceType`: EC2 instance type
- `region`: AWS region ID
- `os`: Operating system

**State**
- `hours`: Number of hours per month
- `riTerm`: Reserved instance term
- `riPayment`: Reserved instance payment option
- `results`: Calculation results
- `loading`: Loading state
- `error`: Error state

**Functions**
- `calculateSavings`: Sends calculation request to the API
- Formats results for display

**Rendering**
- Renders a form for input parameters
- Shows calculation results
- Shows loading indicator while calculating
- Shows error message if calculation fails

### InstanceComparison

Allows users to compare specifications and pricing of multiple instances side by side.

**Props**
- `instances`: Array of instances to compare

**Functions**
- `calculateDifference`: Calculates percentage difference between values
- Formats values for display

**Rendering**
- Renders a table comparing instance specifications
- Shows percentage differences between instances
- Shows info message if no instances are selected

### PriceAlerts

Enables users to set up alerts for price drops below specified thresholds.

**Props**
- `instanceType`: EC2 instance type
- `region`: AWS region ID
- `os`: Operating system

**State**
- `alert`: Alert configuration
- `loading`: Loading state
- `error`: Error state
- `success`: Success state

**Functions**
- `createAlert`: Sends alert creation request to the API
- `handleChange`: Handles form input changes

**Rendering**
- Renders a form for alert configuration
- Shows success message when alert is created
- Shows loading indicator while creating alert
- Shows error message if alert creation fails

## Utility Components

### DataGrid

Uses MUI X-Data-Grid to display instance data with advanced features.

**Props**
- `rows`: Array of instance data
- `columns`: Column configuration
- `loading`: Loading state
- `onRowSelectionModelChange`: Callback for row selection

**Features**
- Sorting
- Filtering
- Column resizing
- Row selection
- Export to CSV
- Pagination

## Hooks

### useInstanceData

Custom hook for fetching and filtering instance data.

**Parameters**
- `region`: AWS region ID

**Returns**
- `instances`: Filtered instance data
- `loading`: Loading state
- `error`: Error state
- `filters`: Current filters
- `updateFilter`: Function to update a filter
- `resetFilters`: Function to reset all filters

**Usage**
```jsx
const {
  instances,
  loading,
  error,
  filters,
  updateFilter,
  resetFilters
} = useInstanceData('us-east-1');
```

## Services

### api.js

Service for making API calls to the backend.

**Functions**
- `fetchRegions`: Fetches available AWS regions
- `fetchInstances`: Fetches EC2 instance data for a region
- `fetchPriceHistory`: Fetches price history for an instance type
- `calculateSavings`: Calculates savings between pricing models
- `createPriceAlert`: Creates a price alert

**Usage**
```jsx
import { fetchInstances } from '../services/api';

const fetchData = async () => {
  try {
    const data = await fetchInstances('us-east-1');
    setInstances(data);
  } catch (error) {
    setError('Failed to fetch instance data');
  }
};
```

## Utilities

### formatters.js

Utility functions for formatting data.

**Functions**
- `formatPrice`: Formats a price value to a currency string
- `formatPriceBreakdown`: Formats a price as hourly, monthly, and yearly
- `formatDate`: Formats a date string to a readable format
- `formatPercentage`: Formats a percentage value
- `calculatePercentageDifference`: Calculates percentage difference between two values
- `formatMemory`: Formats memory size (GiB)

**Usage**
```jsx
import { formatPrice } from '../utils/formatters';

<TableCell>{formatPrice(instance.onDemand)}</TableCell>
```

## Styling

### components.css

CSS styles for components.

**Classes**
- `.price-history-chart`: Styles for the price history chart
- `.savings-result`: Styles for the savings calculator results
- `.comparison-table`: Styles for the instance comparison table
- `.alert-form`: Styles for the price alerts form
- `.section-title`: Styles for section titles
- `.loading-container`: Styles for loading indicators
- `.error-message`: Styles for error messages
- `.info-message`: Styles for info messages

**Usage**
```jsx
import '../styles/components.css';

<div className="price-history-chart">
  <Line data={chartData} options={chartOptions} />
</div>
```
