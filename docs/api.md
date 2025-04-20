# AWS EC2 Instance Pricing Tool API Documentation

This document provides detailed information about the API endpoints available in the AWS EC2 Instance Pricing Tool.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:4000/api
```

## Authentication

Currently, the API does not require authentication. In a production environment, you should implement proper authentication and authorization.

## Endpoints

### Regions

#### Get All Regions

```
GET /regions
```

Returns a list of all available AWS regions.

**Response**

```json
[
  {
    "id": "us-east-1",
    "name": "US East (N. Virginia)"
  },
  {
    "id": "us-east-2",
    "name": "US East (Ohio)"
  },
  ...
]
```

### Instances

#### Get Instances by Region

```
GET /instances/:region
```

Returns a list of EC2 instances with pricing information for the specified region.

**Parameters**

- `region` (path parameter): AWS region ID (e.g., "us-east-1")

**Response**

```json
[
  {
    "instanceType": "t3.micro",
    "vCPU": 2,
    "memoryGiB": 1.0,
    "networkPerformance": "Up to 5 Gigabit",
    "os": "Linux",
    "onDemand": 0.0104,
    "reserved": 0.0073,
    "spot": 0.0031,
    "spotLastUpdated": "2023-06-01T12:00:00Z"
  },
  ...
]
```

### Price History

#### Get Price History

```
GET /price-history/:region/:instanceType
```

Returns historical pricing data for a specific instance type in a specific region.

**Parameters**

- `region` (path parameter): AWS region ID (e.g., "us-east-1")
- `instanceType` (path parameter): EC2 instance type (e.g., "t3.micro")

**Response**

```json
[
  {
    "timestamp": "2023-06-01T00:00:00Z",
    "instanceType": "t3.micro",
    "region": "us-east-1",
    "priceType": "onDemand",
    "price": 0.0104
  },
  {
    "timestamp": "2023-06-01T00:00:00Z",
    "instanceType": "t3.micro",
    "region": "us-east-1",
    "priceType": "spot",
    "price": 0.0031
  },
  ...
]
```

### Savings Calculator

#### Calculate Savings

```
POST /calculate-savings
```

Calculates potential savings between different pricing models.

**Request Body**

```json
{
  "instanceType": "t3.micro",
  "region": "us-east-1",
  "os": "Linux",
  "hours": 730,
  "riTerm": "1yr",
  "riPayment": "no_upfront"
}
```

**Parameters**

- `instanceType` (required): EC2 instance type
- `region` (required): AWS region ID
- `os` (required): Operating system ("Linux" or "Windows")
- `hours` (required): Number of hours to calculate for
- `riTerm` (optional): Reserved instance term ("1yr" or "3yr")
- `riPayment` (optional): Reserved instance payment option ("no_upfront", "partial_upfront", or "all_upfront")

**Response**

```json
{
  "onDemand": {
    "hourly": 0.0104,
    "total": 7.592
  },
  "spot": {
    "hourly": 0.0031,
    "total": 2.263
  },
  "reserved": {
    "hourly": 0.0073,
    "upfront": 0,
    "total": 5.329
  },
  "savings": {
    "spotVsOnDemand": 5.329,
    "reservedVsOnDemand": 2.263,
    "spotVsReserved": 3.066
  }
}
```

### Price Alerts

#### Create Price Alert

```
POST /price-alerts
```

Creates a new price alert.

**Request Body**

```json
{
  "instanceType": "t3.micro",
  "region": "us-east-1",
  "os": "Linux",
  "priceType": "spot",
  "threshold": 0.0025,
  "email": "user@example.com"
}
```

**Parameters**

- `instanceType` (required): EC2 instance type
- `region` (required): AWS region ID
- `os` (required): Operating system ("Linux" or "Windows")
- `priceType` (required): Price type ("onDemand", "reserved", or "spot")
- `threshold` (required): Price threshold
- `email` (required): Email address for notifications

**Response**

```json
{
  "id": "123456789",
  "instanceType": "t3.micro",
  "region": "us-east-1",
  "os": "Linux",
  "priceType": "spot",
  "threshold": 0.0025,
  "email": "user@example.com",
  "active": true,
  "createdAt": "2023-06-01T12:00:00Z"
}
```

#### Get Price Alerts

```
GET /price-alerts?email=user@example.com
```

Returns all price alerts for a specific email address.

**Parameters**

- `email` (query parameter): Email address

**Response**

```json
[
  {
    "id": "123456789",
    "instanceType": "t3.micro",
    "region": "us-east-1",
    "os": "Linux",
    "priceType": "spot",
    "threshold": 0.0025,
    "email": "user@example.com",
    "active": true,
    "createdAt": "2023-06-01T12:00:00Z"
  },
  ...
]
```

#### Update Price Alert

```
PUT /price-alerts/:id
```

Updates an existing price alert.

**Parameters**

- `id` (path parameter): Alert ID

**Request Body**

```json
{
  "threshold": 0.0030,
  "active": false
}
```

**Response**

```json
{
  "id": "123456789",
  "threshold": 0.0030,
  "active": false,
  "updatedAt": "2023-06-02T12:00:00Z"
}
```

#### Delete Price Alert

```
DELETE /price-alerts/:id
```

Deletes a price alert.

**Parameters**

- `id` (path parameter): Alert ID

**Response**

```json
{
  "success": true
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include an `error` field with a descriptive message:

```json
{
  "error": "Invalid region"
}
```

## Rate Limiting

Currently, there is no rate limiting implemented. In a production environment, you should implement rate limiting to prevent abuse.

## CORS

The API supports Cross-Origin Resource Sharing (CORS) and allows requests from any origin. In a production environment, you should restrict this to specific origins.
