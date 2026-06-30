# IMII Domes Stability - Deployment Guide

Complete guide to deploy the full-stack IMII Domes Stability monitoring application to AWS.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Node.js** 20.x or later
3. **pnpm** package manager
4. **AWS CLI** configured with credentials
5. **AWS CDK CLI**: `npm install -g aws-cdk`

## Step 1: Deploy the Back-End

### 1.1 Install Dependencies

```bash
cd back-end
npm install
```

### 1.2 Install Lambda Layer Dependencies

```bash
cd lambda/layers/common/nodejs
npm install
cd ../../../..
```

### 1.3 Bootstrap CDK (First Time Only)

If this is your first time using CDK in your AWS account:

```bash
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

Replace `ACCOUNT-NUMBER` with your AWS account ID and `REGION` with your preferred region (e.g., `us-east-1`).

### 1.4 Deploy the Stack

```bash
npm run build
npm run deploy
```

This will:
- Create DynamoDB tables for sites, beams, detections, inventory, and time series data
- Deploy Lambda functions for API endpoints
- Set up API Gateway REST API
- Create S3 bucket for detection images
- Configure IAM roles and permissions

**Important**: Note the API Gateway URL from the deployment output. You'll need this for the front-end.

Example output:
```
Outputs:
ImiiDomesBackendStack.ApiUrl = https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/
```

### 1.5 Seed the Database

After deployment, populate the database with initial demo data:

```bash
# Replace with your actual API URL
API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com/prod"

curl -X POST $API_URL/api/seed
```

You should see a response like:
```json
{
  "message": "Data seeding completed successfully",
  "totalRecords": 250,
  "sites": 5
}
```

## Step 2: Configure the Front-End

### 2.1 Update Environment Variables

In the `front-end` directory, update the `.env.local` file with your API URL:

```bash
cd ../front-end
```

Edit `.env.local`:
```env
VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api
```

Replace with the actual API URL from Step 1.4.

### 2.2 Install Front-End Dependencies

```bash
pnpm install
```

### 2.3 Test Locally

```bash
pnpm run dev
```

Open http://localhost:5173 in your browser. The app should now connect to your deployed back-end API.

### 2.4 Build for Production

```bash
pnpm run build
```

This creates an optimized production build in the `dist` folder.

## Step 3: Deploy the Front-End

You have several options for deploying the front-end:

### Option A: AWS S3 + CloudFront (Recommended)

1. **Create S3 bucket for hosting:**
```bash
aws s3 mb s3://imii-domes-frontend --region us-east-1
aws s3 website s3://imii-domes-frontend --index-document index.html
```

2. **Upload build files:**
```bash
cd front-end
aws s3 sync dist/ s3://imii-domes-frontend --delete
```

3. **Set up CloudFront distribution** (optional, for HTTPS and better performance):
   - Go to AWS CloudFront Console
   - Create a new distribution
   - Set origin to your S3 bucket
   - Enable HTTPS
   - Deploy

### Option B: Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd front-end
vercel --prod
```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add `VITE_API_URL` with your API Gateway URL

### Option C: AWS Amplify

1. **Push code to GitHub**
2. **Connect to AWS Amplify Console:**
   - Go to AWS Amplify Console
   - Connect your GitHub repository
   - Set build settings:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - cd front-end
             - pnpm install
         build:
           commands:
             - pnpm run build
       artifacts:
         baseDirectory: front-end/dist
         files:
           - '**/*'
       cache:
         paths:
           - front-end/node_modules/**/*
     ```
   - Set environment variable `VITE_API_URL`
3. **Deploy**

## Step 4: Update CORS Settings (Production)

For production, update the CORS settings in the back-end to restrict access to your domain:

Edit `back-end/lib/imii-domes-backend-stack.ts`:

```typescript
defaultCorsPreflightOptions: {
  allowOrigins: ['https://your-domain.com'], // Replace with your domain
  allowMethods: apigateway.Cors.ALL_METHODS,
  allowHeaders: [
    'Content-Type',
    'X-Amz-Date',
    'Authorization',
    'X-Api-Key',
    'X-Amz-Security-Token',
  ],
},
```

Then redeploy:
```bash
cd back-end
npm run deploy
```

## Testing the Deployment

### Test API Endpoints

```bash
API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com/prod"

# Get all sites
curl $API_URL/api/dashboard/sites

# Get dashboard data for a site
curl "$API_URL/api/dashboard/Nutrien%20Allan"

# Get structural monitoring data
curl "$API_URL/api/structural/Nutrien%20Allan"

# Get detection data
curl "$API_URL/api/detections/Nutrien%20Allan"

# Get inventory data
curl "$API_URL/api/inventory/Nutrien%20Allan"
```

### Test Front-End

1. Open your deployed front-end URL
2. Select different sites from the dropdown
3. Navigate through Dashboard, Structural Monitoring, Foreign Material Detection, and Inventory pages
4. Verify data loads from the back-end API

## Monitoring and Logs

### View Lambda Logs

```bash
# View logs for a specific function
aws logs tail /aws/lambda/ImiiDomesBackendStack-DashboardFunction --follow

# View all function logs
aws logs tail /aws/lambda/ImiiDomesBackendStack --follow
```

### CloudWatch Dashboard

Go to AWS CloudWatch console to view:
- Lambda invocation metrics
- API Gateway request metrics
- DynamoDB table metrics
- Error rates and latency

## Updating the Application

### Update Back-End

```bash
cd back-end
# Make your changes
npm run build
npm run deploy
```

### Update Front-End

```bash
cd front-end
# Make your changes
pnpm run build

# Then deploy using your chosen method (S3, Vercel, Amplify)
```

## Cost Optimization

### Free Tier Eligible Services

- API Gateway: 1M API calls/month
- Lambda: 1M requests/month + 400,000 GB-seconds
- DynamoDB: 25 GB storage + 25 RCU/WCU
- S3: 5 GB storage + 20,000 GET requests

### Estimated Monthly Costs (Beyond Free Tier)

For moderate usage (~10,000 requests/day):
- API Gateway: ~$3.50
- Lambda: ~$1.00
- DynamoDB: ~$1.25
- S3: ~$0.50
- **Total: ~$6.25/month**

## Cleanup

To delete all resources and avoid charges:

```bash
cd back-end
npm run destroy
```

This will delete:
- All Lambda functions
- API Gateway
- DynamoDB tables (and all data)
- S3 bucket (and all images)
- IAM roles

## Troubleshooting

### Issue: API returns CORS errors

**Solution**: Check that your front-end domain is allowed in the CORS settings in the CDK stack.

### Issue: Lambda function timeout

**Solution**: Increase timeout in `lib/imii-domes-backend-stack.ts`:
```typescript
timeout: cdk.Duration.seconds(60), // Increase from 30
```

### Issue: DynamoDB throttling

**Solution**: The tables use on-demand billing, but if you're hitting limits, check your request patterns.

### Issue: Front-end shows "Network Error"

**Solution**: 
1. Verify the API URL in `.env.local` is correct
2. Check that the API is deployed and accessible
3. Verify CORS settings allow your domain
4. Check browser console for specific error messages

## Support

For issues or questions:
1. Check CloudWatch logs for Lambda functions
2. Verify API Gateway endpoint is accessible
3. Check DynamoDB tables have data
4. Review CDK deployment output for any errors

## Next Steps

- Add authentication with AWS Cognito
- Set up CloudWatch alarms for monitoring
- Implement API rate limiting
- Add CI/CD pipeline with GitHub Actions
- Configure custom domain name
- Add WAF rules for API protection
