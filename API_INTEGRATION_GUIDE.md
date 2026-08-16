# API Integration Guide

## Overview
This document outlines the complete backend and frontend API integration for the IMII Domes Monitoring System.

## Architecture

### Backend (AWS CDK)
- **Infrastructure**: AWS Lambda, API Gateway, DynamoDB, S3
- **Location**: `/back-end`
- **CDK Stack**: `lib/imii-domes-backend-stack.ts`

### Frontend (React + Vite)
- **Framework**: React with TypeScript
- **Location**: `/front-end`
- **API Service**: `src/services/api.ts`

## Backend Endpoints

### 1. Dashboard API
**Base Path**: `/api/dashboard`

#### GET /api/dashboard/sites
- **Description**: Get list of all sites
- **Response**: Array of site names
- **Example**: `["Nutrien Allan", "Nutrien Lanigan", ...]`

#### GET /api/dashboard/{site}
- **Description**: Get dashboard overview for a specific site
- **Parameters**: 
  - `site` (path): Site name (URL encoded)
- **Response**:
  ```json
  {
    "structuralHealth": "94%",
    "beamsInspection": 2,
    "foreignAlerts": 3,
    "inventory": "8,450 tons",
    "capacity": "87%"
  }
  ```

### 2. Structural Monitoring API
**Base Path**: `/api/structural`

#### GET /api/structural/{site}
- **Description**: Get structural monitoring data for a site
- **Parameters**:
  - `site` (path): Site name (URL encoded)
- **Response**:
  ```json
  {
    "totalBeams": 8,
    "healthy": 6,
    "warning": 2,
    "beams": [...],
    "stressData": [...]
  }
  ```

#### PUT /api/structural/beams/{beamId}
- **Description**: Update beam status
- **Parameters**:
  - `beamId` (path): Beam identifier
- **Body**:
  ```json
  {
    "status": "good" | "warning" | "critical",
    "siteId": "Nutrien Allan"
  }
  ```

### 3. Foreign Material Detection API
**Base Path**: `/api/detections`

#### GET /api/detections/{site}
- **Description**: Get detection data for a site
- **Parameters**:
  - `site` (path): Site name (URL encoded)
- **Response**:
  ```json
  {
    "activeAlerts": 3,
    "resolvedToday": 3,
    "cameras": 16,
    "accuracy": "98.5%",
    "detections": [...],
    "weeklyData": [...]
  }
  ```

#### POST /api/detections/{detectionId}/resolve
- **Description**: Mark a detection as resolved
- **Parameters**:
  - `detectionId` (path): Detection identifier
- **Body**:
  ```json
  {
    "siteId": "Nutrien Allan"
  }
  ```

### 4. Inventory Monitoring API
**Base Path**: `/api/inventory`

#### GET /api/inventory/{site}
- **Description**: Get inventory data for a site
- **Parameters**:
  - `site` (path): Site name (URL encoded)
- **Response**:
  ```json
  {
    "totalInventory": "8,450 tons",
    "totalChange": "+255",
    "totalCapacity": 10000,
    "avgDailyChange": "+36",
    "barns": [...],
    "volumeData": [...]
  }
  ```

#### PUT /api/inventory/barns/{barnId}
- **Description**: Update barn inventory
- **Parameters**:
  - `barnId` (path): Barn identifier
- **Body**:
  ```json
  {
    "amount": 100,
    "siteId": "Nutrien Allan"
  }
  ```

## Deployment Instructions

### Backend Deployment

1. **Install Dependencies**
   ```bash
   cd back-end
   npm install
   ```

2. **Bootstrap CDK (First Time Only)**
   ```bash
   cdk bootstrap
   ```

3. **Deploy Stack**
   ```bash
   cdk deploy
   ```

4. **Note the API URL**
   After deployment, CDK will output the API Gateway URL. Save this for frontend configuration.

5. **Seed Initial Data** (Optional)
   ```bash
   curl -X POST https://YOUR-API-URL/prod/api/seed
   ```

### Frontend Configuration

1. **Create Environment File**
   ```bash
   cd front-end
   cp .env.example .env.local
   ```

2. **Update API URL**
   Edit `.env.local`:
   ```env
   VITE_API_URL=https://YOUR-API-GATEWAY-URL/prod/api
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   ```

5. **Build for Production**
   ```bash
   pnpm build
   ```

## Frontend API Integration

### API Service Structure
Located at `front-end/src/services/api.ts`

#### Key Features:
- **Type Safety**: Full TypeScript support with interfaces
- **Error Handling**: Centralized error handling with `ApiError` class
- **CORS Support**: Configured for cross-origin requests
- **Environment Configuration**: Uses Vite environment variables

#### Usage Example:

```typescript
import { dashboardApi, structuralApi, detectionApi, inventoryApi } from '@/services/api';

// Get dashboard data
const dashboardData = await dashboardApi.getSiteData('Nutrien Allan');

// Get structural data
const structuralData = await structuralApi.getBeams('Nutrien Allan');

// Update beam status
await structuralApi.updateBeamStatus('B-01', 'Nutrien Allan', 'warning');

// Get detections
const detections = await detectionApi.getDetections('Nutrien Allan');

// Resolve a detection
await detectionApi.resolveDetection('1', 'Nutrien Allan');

// Get inventory
const inventory = await inventoryApi.getInventory('Nutrien Allan');

// Update barn inventory
await inventoryApi.updateBarnInventory('1', 'Nutrien Allan', 100);
```

### Component Integration

All components have been updated to use the API services:
- `Dashboard.tsx` - Uses `dashboardApi`
- `StructuralMonitoring.tsx` - Uses `structuralApi`
- `ForeignMaterialDetection.tsx` - Uses `detectionApi`
- `InventoryMonitoring.tsx` - Uses `inventoryApi`

Each component:
1. Fetches data on mount using `useEffect`
2. Displays loading state while fetching
3. Shows error messages if API calls fail
4. Falls back to mock data on error for resilience

## Testing

### Backend Testing

1. **Test Dashboard Endpoint**
   ```bash
   curl https://YOUR-API-URL/prod/api/dashboard/sites
   ```

2. **Test Site Data**
   ```bash
   curl https://YOUR-API-URL/prod/api/dashboard/Nutrien%20Allan
   ```

3. **Test Structural Data**
   ```bash
   curl https://YOUR-API-URL/prod/api/structural/Nutrien%20Allan
   ```

4. **Test Detections**
   ```bash
   curl https://YOUR-API-URL/prod/api/detections/Nutrien%20Allan
   ```

5. **Test Inventory**
   ```bash
   curl https://YOUR-API-URL/prod/api/inventory/Nutrien%20Allan
   ```

### Frontend Testing

1. **Start Development Server**
   ```bash
   cd front-end
   pnpm dev
   ```

2. **Open Browser**
   Navigate to `http://localhost:5173`

3. **Test Each Page**
   - Dashboard: Should show site statistics
   - Structural Monitoring: Should display beams and stress data
   - Foreign Material Detection: Should show active detections
   - Inventory Monitoring: Should display barn inventory

4. **Check Browser Console**
   - No errors should appear
   - API calls should succeed
   - Data should be displayed correctly

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptom**: Browser console shows CORS policy errors
**Solution**: 
- Check API Gateway CORS configuration
- Ensure backend allows your frontend domain

#### 2. 404 Errors
**Symptom**: API calls return 404
**Solution**:
- Verify API Gateway URL is correct in `.env.local`
- Check endpoint paths match exactly
- Ensure backend is deployed

#### 3. Empty Data
**Symptom**: Components show no data
**Solution**:
- Run the seeder endpoint to populate database
- Check DynamoDB tables have data
- Verify Lambda functions have correct permissions

#### 4. TypeScript Errors
**Symptom**: Type errors in IDE
**Solution**:
- Ensure `vite-env.d.ts` exists in `src/`
- Run `pnpm install` to get type definitions
- Restart TypeScript server in IDE

#### 5. Environment Variables Not Working
**Symptom**: API calls go to localhost instead of actual API
**Solution**:
- Restart Vite development server after changing `.env.local`
- Check variable name starts with `VITE_`
- Ensure `.env.local` is not in `.gitignore` (it should be)

## Data Flow

1. **User Action** → Frontend Component
2. **Component** → API Service (`api.ts`)
3. **API Service** → HTTP Request to API Gateway
4. **API Gateway** → Lambda Function
5. **Lambda Function** → DynamoDB/S3
6. **DynamoDB/S3** → Lambda Function
7. **Lambda Function** → API Gateway
8. **API Gateway** → Frontend
9. **Frontend** → Update UI

## Security Considerations

### Current Implementation (Development)
- CORS allows all origins
- No authentication required
- All data is publicly accessible

### Production Recommendations
1. **Add Authentication**: Implement AWS Cognito or similar
2. **Restrict CORS**: Allow only your frontend domain
3. **Add API Keys**: Require API keys for backend access
4. **Enable WAF**: Use AWS WAF for additional security
5. **Encrypt Data**: Enable encryption at rest for DynamoDB
6. **Use HTTPS**: Ensure all traffic uses HTTPS
7. **Rate Limiting**: Implement API throttling

## Performance Optimization

### Backend
- Lambda functions use common layer for shared code
- DynamoDB uses on-demand billing for cost optimization
- API Gateway has throttling enabled (50 req/s, 100 burst)
- S3 has lifecycle rules for automatic cleanup

### Frontend
- API responses are cached in component state
- Data fetches on site change only, not every render
- Loading states prevent multiple simultaneous requests
- Error boundaries catch and display API errors gracefully

## Monitoring

### CloudWatch Metrics
- Lambda invocation counts
- Lambda error rates
- API Gateway 4xx/5xx errors
- DynamoDB read/write capacity

### Recommended Alarms
- Lambda errors > 5 in 5 minutes
- API Gateway 5xx errors > 10 in 5 minutes
- DynamoDB throttled requests > 0

## Maintenance

### Regular Tasks
1. **Monitor Costs**: Check AWS billing dashboard weekly
2. **Review Logs**: Check CloudWatch logs for errors
3. **Update Dependencies**: Keep Lambda layer and frontend dependencies current
4. **Backup Data**: Regular DynamoDB backups (Point-in-Time Recovery enabled)
5. **Clean S3**: Review and clean old detection images

### Updating the Application

#### Backend Updates
```bash
cd back-end
# Make your changes
cdk diff  # Review changes
cdk deploy  # Deploy updates
```

#### Frontend Updates
```bash
cd front-end
# Make your changes
pnpm build  # Build for production
# Deploy to your hosting service (S3, Vercel, etc.)
```

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## Support

For issues or questions:
1. Check CloudWatch logs for backend errors
2. Check browser console for frontend errors
3. Review this guide for common issues
4. Check AWS service health status
