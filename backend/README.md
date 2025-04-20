# AWS EC2 Instance Pricing Tool - Backend

This is the backend API for the AWS EC2 Instance Pricing Tool. It's built with Express.js and AWS SDK to provide pricing data for EC2 instances across different regions, operating systems, and pricing models.

## Directory Structure

```
backend/
├── src/                 # Source code
│   ├── controllers/     # API controllers
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
├── server.js            # Server entry point
└── package.json         # Dependencies
```

## API Endpoints

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

## Features

- **AWS Integration**: Fetches real-time pricing data from AWS Pricing API
- **Caching**: Implements caching to reduce API calls to AWS
- **Price History**: Tracks and stores historical pricing data
- **Savings Calculation**: Calculates potential savings between different pricing models
- **Price Alerts**: Monitors prices and sends alerts when thresholds are met

## Dependencies

- **Express.js**: Web framework
- **AWS SDK**: AWS API integration
- **MongoDB** (optional): Database for storing price history and alerts
- **Node-cron**: Scheduled tasks for price updates

## Configuration

The backend requires AWS credentials to access the AWS Pricing API. These can be configured in several ways:

1. Environment variables:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   ```

2. AWS credentials file (`~/.aws/credentials`)

3. IAM roles (when deployed on AWS)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the server in production mode.

### `npm run dev`

Runs the server in development mode with nodemon for auto-reloading.

### `npm test`

Runs the test suite.

## Adding New Endpoints

1. Create a new route file in `src/routes`
2. Create a new controller in `src/controllers`
3. Register the route in `server.js`

## Error Handling

The API uses a consistent error handling approach:

- HTTP status codes for different error types
- JSON response with `error` property containing error message
- Detailed logging for server-side errors

## Deployment

### AWS Deployment

1. **EC2**: Deploy as a Node.js application on EC2
2. **Elastic Beanstalk**: Use the Node.js platform
3. **Lambda + API Gateway**: For serverless deployment

### Docker Deployment

Build the Docker image:
```bash
docker build -t aws-pricing-tool-backend .
```

Run the Docker container:
```bash
docker run -p 4000:4000 -d aws-pricing-tool-backend
```

## Security Considerations

- AWS credentials should be kept secure and never committed to version control
- Use IAM roles with least privilege principle when possible
- Implement rate limiting to prevent abuse
- Consider adding authentication for production deployments
