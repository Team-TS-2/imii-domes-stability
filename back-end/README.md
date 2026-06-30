# IMII Domes Backend Infrastructure

AWS CDK-based backend infrastructure for the IMII Domes Stability monitoring system.

## Architecture

- **API Gateway**: RESTful API endpoints
- **Lambda Functions**: Serverless compute for business logic
- **DynamoDB**: NoSQL database for storing monitoring data
- **S3**: Object storage for detection images
- **CloudWatch**: Logging and monitoring

## Prerequisites

- Node.js 20.x or later
- AWS CLI configured with appropriate credentials
- AWS CDK CLI (`npm install -g aws-cdk`)

## Installation

```bash
cd back-end
npm install

# Install Lambda layer dependencies
cd lambda/layers/common/nodejs
npm install
cd ../../../..
```

## Deployment

```bash
# Build the TypeScript code
npm run build

# Synthesize CloudFormation template
npm run synth

# Deploy to AWS
npm run deploy

# After deployment, seed the database with initial data
# Call the /api/seed endpoint with POST method
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/sites` - List all sites
- `GET /api/dashboard/{site}` - Get dashboard data for a site

### Structural Monitoring
- `GET /api/structural/{site}` - Get structural monitoring data
- `PUT /api/structural/beams/{beamId}` - Update beam status

### Foreign Material Detection
- `GET /api/detections/{site}` - Get detection data
- `POST /api/detections/{detectionId}/resolve` - Resolve a detection

### Inventory
- `GET /api/inventory/{site}` - Get inventory data
- `PUT /api/inventory/barns/{barnId}` - Update barn inventory

### Seeding
- `POST /api/seed` - Populate database with initial demo data

## Environment Variables

The Lambda functions use the following environment variables (automatically set by CDK):

- `SITES_TABLE` - DynamoDB Sites table name
- `BEAMS_TABLE` - DynamoDB Beams table name
- `DETECTIONS_TABLE` - DynamoDB Detections table name
- `INVENTORY_TABLE` - DynamoDB Inventory table name
- `TIMESERIES_TABLE` - DynamoDB Time Series table name
- `IMAGES_BUCKET` - S3 bucket for detection images

## Testing

After deployment, you can test the API using curl or Postman:

```bash
# Get the API URL from CDK output
API_URL="your-api-gateway-url"

# Seed the database
curl -X POST $API_URL/api/seed

# Get dashboard data
curl $API_URL/api/dashboard/Nutrien%20Allan

# List all sites
curl $API_URL/api/dashboard/sites
```

## Clean Up

To avoid incurring charges, delete the stack when done:

```bash
npm run destroy
```

## Development

```bash
# Watch for changes and rebuild
npm run watch

# View diff of changes
npm run diff
```

## Lambda Functions

- **Dashboard**: Aggregates data for the main dashboard view
- **Structural**: Manages beam monitoring data
- **Detection**: Handles foreign material detection alerts
- **Inventory**: Tracks potash inventory levels
- **Seeder**: Populates initial demo data

## Database Schema

### Sites Table
- PK: `siteId` (string)

### Beams Table
- PK: `siteId` (string)
- SK: `beamId` (string)

### Detections Table
- PK: `siteId` (string)
- SK: `detectionId` (string)
- GSI: `status-index` (siteId + status)

### Inventory Table
- PK: `siteId` (string)
- SK: `barnId` (string)

### Time Series Table
- PK: `metricKey` (string) - Format: `{siteId}#{metricType}`
- SK: `timestamp` (number)
- TTL: `ttl` - Auto-deletes after 90 days
