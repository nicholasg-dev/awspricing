# AWS EC2 Instance Pricing Tool - Frontend

This is the frontend application for the AWS EC2 Instance Pricing Tool. It's built with React and Material UI to provide a user-friendly interface for comparing AWS EC2 instance pricing across different regions, operating systems, and pricing models.

## Directory Structure

```
src/
├── components/      # React components
│   ├── PriceHistory.jsx       # Price history chart component
│   ├── SavingsCalculator.jsx   # Savings calculator component
│   ├── InstanceComparison.jsx  # Instance comparison component
│   ├── PriceAlerts.jsx        # Price alerts component
│   └── index.js               # Component exports
├── hooks/           # Custom React hooks
├── services/        # API service functions
├── styles/          # CSS and style files
├── utils/           # Utility functions
├── App.js           # Main application component
├── App.css          # Main application styles
├── index.js         # Application entry point
└── index.css        # Global styles
```

## Components

### Main Components

- **App.js**: The main application component that handles routing, state management, and renders the UI.

### Enhanced Components

- **PriceHistory**: Displays historical pricing data for EC2 instances using Chart.js.
- **SavingsCalculator**: Calculates potential savings between different pricing models (On-Demand, Reserved, Spot).
- **InstanceComparison**: Allows users to compare specifications and pricing of multiple instances side by side.
- **PriceAlerts**: Enables users to set up alerts for price drops below specified thresholds.

## Features

- **Tabbed Interface**: Easy navigation between different features (Pricing, History, Compare, Alerts, Calculator).
- **Interactive Data Grid**: Advanced filtering, sorting, and export capabilities for instance data.
- **Data Visualization**: Charts for price history and comparison data.
- **Responsive Design**: Works on desktop and mobile devices.

## Dependencies

- **React**: UI library
- **Material UI**: Component library for consistent design
- **Chart.js & react-chartjs-2**: Data visualization
- **MUI X-Data-Grid**: Advanced data grid component

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## API Integration

The frontend communicates with the backend API for the following operations:

- Fetching available AWS regions
- Retrieving EC2 instance pricing data
- Getting price history for specific instances
- Calculating savings between different pricing models
- Creating and managing price alerts

## Adding New Components

1. Create a new component file in the `src/components` directory
2. Export the component in `src/components/index.js`
3. Import and use the component in `App.js` or other components

## Styling Guidelines

- Use Material UI's styling system with the `sx` prop for component-specific styles
- Use the theme for consistent colors, spacing, and typography
- Place global styles in `index.css`
- Component-specific styles can be placed in the component file using the `sx` prop

## Testing

Components should have corresponding test files in the same directory. Run tests with:

```bash
npm test
```

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.
