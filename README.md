# AWS EC2 Instance Pricing Tool

A comprehensive tool to compare AWS EC2 instance pricing across different regions, operating systems, and pricing models (On-Demand, Reserved, and Spot). This application helps users make informed decisions about AWS EC2 instance selection based on pricing and specifications.

![AWS Pricing Tool Screenshot](docs/screenshot.png)

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features
- View EC2 instance details (vCPU, memory, network performance)
- Compare On-Demand, Reserved, and Spot pricing
- Filter by region, OS (Linux/Windows), and pricing type
- Interactive data grid with sorting, filtering, and export capabilities

### Enhanced Features
- **Price History**: View historical pricing data for instances
- **Savings Calculator**: Calculate potential savings between different pricing models
- **Instance Comparison**: Compare specifications and pricing of multiple instances
- **Price Alerts**: Set up alerts for price drops below specified thresholds
- **Tabbed Interface**: Easy navigation between different features

## Project Structure

```
aws-pricing-tool/
├── backend/                 # Express.js backend
│   ├── src/                 # Backend source code
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── server.js            # Backend entry point
│   └── package.json         # Backend dependencies
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/                 # React source code
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── styles/          # CSS and style files
│   │   └── utils/           # Utility functions
│   └── package.json         # Frontend dependencies
├── docs/                    # Documentation files
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Root package.json for running both services
└── README.md               # Project documentation
```

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **AWS SDK**: AWS API integration
- **MongoDB**: Database for storing price history and alerts (optional)
- **Node-cron**: Scheduled tasks for price updates

### Frontend
- **React**: UI library
- **Material UI**: Component library
- **Chart.js**: Data visualization
- **React-chartjs-2**: React wrapper for Chart.js
- **MUI X-Data-Grid**: Advanced data grid component

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- AWS credentials with EC2 and Pricing API access
- MongoDB (optional, for price history and alerts)

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/aws-pricing-tool.git
   cd aws-pricing-tool
   ```

2. Install dependencies
   ```bash
   npm run install-all
   ```

## Configuration

1. Create a `.env` file in the root directory based on `.env.example`:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   MONGODB_URI=your_mongodb_connection_string (optional)
   PORT=4000
   ```

2. Alternatively, configure AWS credentials using the AWS CLI:
   ```bash
   aws configure
   ```

## Running the Application

### Development Mode

To run both the backend and frontend concurrently:
```bash
npm run dev
```

To run only the backend:
```bash
npm run server
```

To run only the frontend:
```bash
npm run client
```

### Production Mode

Build the frontend:
```bash
cd frontend && npm run build
```

Start the production server:
```bash
npm start
```

## API Documentation

### Regions
- `GET /api/regions` - Get list of available AWS regions

### Instances
- `GET /api/instances/:region` - Get EC2 instance pricing data for a specific region

### Price History
- `GET /api/price-history/:region/:instanceType` - Get price history for a specific instance type

### Savings Calculator
- `POST /api/calculate-savings` - Calculate savings between different pricing models
  - Body: `{ instanceType, region, os, hours, riTerm, riPayment }`

### Price Alerts
- `POST /api/price-alerts` - Create a new price alert
  - Body: `{ instanceType, region, os, priceType, threshold, email, active }`

## Frontend Components

### Main Components
- **App.js**: Main application component with routing and state management
- **DataGrid**: Interactive table for displaying instance data

### Enhanced Components
- **PriceHistory**: Chart component for displaying price history
- **SavingsCalculator**: Form for calculating potential savings
- **InstanceComparison**: Table for comparing multiple instances
- **PriceAlerts**: Form for setting up price alerts

## Development

### Code Style

This project uses ESLint and Prettier for code formatting. Run linting with:
```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint:fix
```

### Adding New Features

1. **Backend**: Add new routes in `backend/src/routes` and controllers in `backend/src/controllers`
2. **Frontend**: Add new components in `frontend/src/components` and services in `frontend/src/services`

## Testing

Run backend tests:
```bash
cd backend && npm test
```

Run frontend tests:
```bash
cd frontend && npm test
```

## Deployment

### AWS Deployment

1. **Backend**: Deploy to AWS Elastic Beanstalk or EC2
2. **Frontend**: Deploy to AWS S3 and CloudFront

### Docker Deployment

Build the Docker image:
```bash
docker build -t aws-pricing-tool .
```

Run the Docker container:
```bash
docker run -p 4000:4000 -d aws-pricing-tool
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

- **Backend**: Express.js, AWS SDK
- **Frontend**: React, Material UI, MUI X-Data-Grid
- **Development**: Nodemon, Concurrently
