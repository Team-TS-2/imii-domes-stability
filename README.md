# IMII Domes Stability Monitoring System

A full-stack IoT monitoring application for potash storage barn structural integrity, foreign material detection, and inventory management.

![Architecture](https://img.shields.io/badge/AWS-Cloud%20Native-orange)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue)
![Backend](https://img.shields.io/badge/Backend-AWS%20Lambda-green)
![Database](https://img.shields.io/badge/Database-DynamoDB-yellow)

## Overview

SmartDome is an enterprise monitoring system designed for potash storage facilities. It provides real-time insights into:

- **Structural Monitoring**: Track beam stress levels and structural health across multiple barns
- **Foreign Material Detection**: AI-powered camera system to detect contamination (seeds, bird droppings, dust)
- **Inventory Management**: Real-time potash volume tracking with capacity utilization
- **Multi-Site Support**: Monitor multiple facilities from a single dashboard

## Features

### Dashboard
- Real-time overview of all monitoring systems
- Site-specific metrics and alerts
- Activity feed with recent events
- Health status indicators

### Structural Monitoring
- Beam stress level tracking
- Interactive charts with historical data
- Forecasting capabilities for predictive maintenance
- Automated inspection scheduling

### Foreign Material Detection
- Computer vision-based detection system
- Image capture with bounding boxes
- Severity classification (low/medium/high)
- Weekly trend analysis
- Resolution tracking

### Inventory Monitoring
- Real-time capacity tracking per barn
- Volume trend visualization
- Distribution analysis with pie charts
- Daily change monitoring

## Technology Stack

### Front-End
- **React 18** with TypeScript
- **React Router** for navigation
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **Lucide React** for icons

### Back-End
- **AWS CDK** for infrastructure as code
- **API Gateway** for RESTful API
- **Lambda** (Node.js 20) for serverless compute
- **DynamoDB** for NoSQL data storage
- **S3** for image storage
- **CloudWatch** for logging and monitoring

## Architecture

```
┌─────────────┐
│   React     │
│  Front-End  │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │
       ├──────┬──────┬──────┬──────┐
       ▼      ▼      ▼      ▼      ▼
    ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
    │ λ  │ │ λ  │ │ λ  │ │ λ  │ │ λ  │
    └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
      │      │      │      │      │
      └──────┴──────┴──────┴──────┘
                    │
                    ▼
            ┌──────────────┐
            │   DynamoDB   │
            │   + S3       │
            └──────────────┘
```

## Project Structure

```
imii-domes-stability/
├── front-end/              # React application
│   ├── src/
│   │   ├── app/           # Application components
│   │   │   ├── components/  # Page components
│   │   │   ├── context/     # React context
│   │   │   └── routes.tsx   # Route definitions
│   │   ├── services/      # API service layer
│   │   └── styles/        # CSS styles
│   ├── package.json
│   └── vite.config.ts
│
├── back-end/              # AWS CDK infrastructure
│   ├── bin/              # CDK app entry point
│   ├── lib/              # CDK stack definitions
│   ├── lambda/           # Lambda function code
│   │   ├── dashboard/   # Dashboard API
│   │   ├── structural/  # Structural monitoring API
│   │   ├── detection/   # Detection API
│   │   ├── inventory/   # Inventory API
│   │   ├── seeder/      # Database seeder
│   │   └── layers/      # Shared Lambda layer
│   ├── cdk.json
│   ├── package.json
│   └── tsconfig.json
│
├── infrastructure/        # Additional infrastructure (future)
├── .github/workflows/    # CI/CD pipeline
└── DEPLOYMENT.md         # Deployment guide
```

## Quick Start

### Prerequisites

- Node.js 20.x or later
- pnpm (for front-end)
- AWS Account with CLI configured
- AWS CDK CLI: `npm install -g aws-cdk`

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/imii-domes-stability.git
cd imii-domes-stability
```

### 2. Deploy the Back-End

```bash
cd back-end
npm install

# Install Lambda layer dependencies
cd lambda/layers/common/nodejs
npm install
cd ../../../..

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy
npm run build
npm run deploy
```

**Note the API URL** from the deployment output.

### 3. Seed the Database

```bash
# Replace with your API URL
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api/seed
```

### 4. Run the Front-End

```bash
cd ../front-end

# Update .env.local with your API URL
echo "VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api" > .env.local

# Install and run
pnpm install
pnpm run dev
```

Open http://localhost:5173

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- AWS infrastructure setup
- Front-end deployment options (S3, Vercel, Amplify)
- Production configuration
- Monitoring and troubleshooting

## API Documentation

### Endpoints

#### Dashboard
- `GET /api/dashboard/sites` - List all sites
- `GET /api/dashboard/{site}` - Get dashboard data

#### Structural Monitoring
- `GET /api/structural/{site}` - Get beam data
- `PUT /api/structural/beams/{beamId}` - Update beam status

#### Foreign Material Detection
- `GET /api/detections/{site}` - Get detection data
- `POST /api/detections/{detectionId}/resolve` - Resolve detection

#### Inventory
- `GET /api/inventory/{site}` - Get inventory data
- `PUT /api/inventory/barns/{barnId}` - Update barn inventory

#### Seeding
- `POST /api/seed` - Populate initial data

## Development

### Front-End Development

```bash
cd front-end
pnpm run dev    # Start dev server
pnpm run build  # Build for production
```

### Back-End Development

```bash
cd back-end
npm run watch   # Watch for changes
npm run synth   # Synthesize CloudFormation
npm run diff    # View changes
```

### Testing

```bash
# Test API endpoints
curl https://your-api.execute-api.us-east-1.amazonaws.com/prod/api/dashboard/sites
```

## Monitored Sites

1. **Nutrien Allan**
2. **Nutrien Lanigan**
3. **Nutrien Cory**
4. **Nutrien Rocanville**
5. **Mosaic Esterhazy**

## Environment Variables

### Front-End (.env.local)
```env
VITE_API_URL=https://your-api-gateway-url/api
```

### Back-End (Auto-configured by CDK)
- `SITES_TABLE` - DynamoDB sites table
- `BEAMS_TABLE` - DynamoDB beams table
- `DETECTIONS_TABLE` - DynamoDB detections table
- `INVENTORY_TABLE` - DynamoDB inventory table
- `TIMESERIES_TABLE` - DynamoDB time series table
- `IMAGES_BUCKET` - S3 bucket for images

## CI/CD

The repository includes a GitHub Actions workflow that:
- Builds the front-end on every push
- Runs on all branches
- Uploads build artifacts

To enable deployment, uncomment the deployment step in `.github/workflows/build-deploy.yml`.

## Cost Estimation

### AWS Free Tier (First 12 months)
- API Gateway: 1M requests/month
- Lambda: 1M requests + 400K GB-seconds
- DynamoDB: 25GB storage + 25 RCU/WCU
- S3: 5GB storage

### Estimated Monthly Cost (Beyond Free Tier)
For ~10,000 requests/day:
- **Total: ~$6-10/month**

## Monitoring

### CloudWatch Metrics
- Lambda function invocations
- API Gateway requests/errors
- DynamoDB read/write capacity
- S3 storage usage

### Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/ImiiDomesBackendStack-DashboardFunction --follow
```

## Security

- API Gateway with CORS configuration
- IAM roles with least privilege
- DynamoDB encryption at rest
- S3 bucket policies
- CloudWatch logging enabled

## Performance

- Serverless architecture scales automatically
- DynamoDB on-demand billing
- CloudFront CDN for front-end (optional)
- Lambda warm-up strategies
- Efficient data queries with GSI

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Roadmap

- [ ] Authentication with AWS Cognito
- [ ] Real-time updates with WebSockets
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and ML predictions
- [ ] Alert notifications (email/SMS)
- [ ] Custom dashboards
- [ ] Export to PDF/Excel
- [ ] Multi-language support

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting
- Review CloudWatch logs for errors

## Acknowledgments

Built with modern cloud-native technologies:
- AWS for cloud infrastructure
- React team for the excellent framework
- shadcn for beautiful UI components
- Recharts for data visualization

---

**Made with ❤️ for potash storage facility monitoring**
