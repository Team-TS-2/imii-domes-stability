import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class ImiiDomesBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ===========================
    // DynamoDB Tables
    // ===========================

    // Sites Table - stores site information
    const sitesTable = new dynamodb.Table(this, 'SitesTable', {
      tableName: 'imii-sites',
      partitionKey: { name: 'siteId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production
      pointInTimeRecovery: true,
    });

    // Beams Table - stores structural monitoring data
    const beamsTable = new dynamodb.Table(this, 'BeamsTable', {
      tableName: 'imii-beams',
      partitionKey: { name: 'siteId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'beamId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // Detections Table - stores foreign material detection data
    const detectionsTable = new dynamodb.Table(this, 'DetectionsTable', {
      tableName: 'imii-detections',
      partitionKey: { name: 'siteId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'detectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // Add GSI for querying by status
    detectionsTable.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'siteId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'status', type: dynamodb.AttributeType.STRING },
    });

    // Inventory Table - stores barn inventory data
    const inventoryTable = new dynamodb.Table(this, 'InventoryTable', {
      tableName: 'imii-inventory',
      partitionKey: { name: 'siteId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'barnId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // Time Series Data Table - stores historical metrics
    const timeSeriesTable = new dynamodb.Table(this, 'TimeSeriesTable', {
      tableName: 'imii-timeseries',
      partitionKey: { name: 'metricKey', type: dynamodb.AttributeType.STRING }, // e.g., "site#metric"
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl', // Auto-delete old data
    });

    // ===========================
    // S3 Bucket for Detection Images
    // ===========================

    const detectionImagesBucket = new s3.Bucket(this, 'DetectionImagesBucket', {
      bucketName: `imii-detection-images-${this.account}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true, // Change to false for production
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['*'], // Update with your domain in production
          allowedHeaders: ['*'],
        },
      ],
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(90), // Delete images after 90 days
        },
      ],
    });

    // ===========================
    // Lambda Layer for Common Dependencies
    // ===========================

    const commonLayer = new lambda.LayerVersion(this, 'CommonLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/layers/common')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Common utilities and AWS SDK',
    });

    // ===========================
    // Lambda Functions
    // ===========================

    // Common environment variables for all Lambda functions
    const commonEnvironment = {
      SITES_TABLE: sitesTable.tableName,
      BEAMS_TABLE: beamsTable.tableName,
      DETECTIONS_TABLE: detectionsTable.tableName,
      INVENTORY_TABLE: inventoryTable.tableName,
      TIMESERIES_TABLE: timeSeriesTable.tableName,
      IMAGES_BUCKET: detectionImagesBucket.bucketName,
    };

    // Dashboard Lambda
    const dashboardFunction = new lambda.Function(this, 'DashboardFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/dashboard')),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      layers: [commonLayer],
    });

    // Structural Monitoring Lambda
    const structuralFunction = new lambda.Function(this, 'StructuralFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/structural')),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      layers: [commonLayer],
    });

    // Detection Lambda
    const detectionFunction = new lambda.Function(this, 'DetectionFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/detection')),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      layers: [commonLayer],
    });

    // Inventory Lambda
    const inventoryFunction = new lambda.Function(this, 'InventoryFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/inventory')),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      layers: [commonLayer],
    });

    // Data Seeder Lambda - for initial data population
    const seederFunction = new lambda.Function(this, 'SeederFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/seeder')),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(300), // 5 minutes for seeding
      memorySize: 1024,
      layers: [commonLayer],
    });

    // ===========================
    // Grant Permissions
    // ===========================

    // Grant DynamoDB permissions
    sitesTable.grantReadWriteData(dashboardFunction);
    sitesTable.grantReadWriteData(structuralFunction);
    sitesTable.grantReadWriteData(detectionFunction);
    sitesTable.grantReadWriteData(inventoryFunction);
    sitesTable.grantReadWriteData(seederFunction);

    beamsTable.grantReadWriteData(structuralFunction);
    beamsTable.grantReadWriteData(seederFunction);

    detectionsTable.grantReadWriteData(detectionFunction);
    detectionsTable.grantReadWriteData(seederFunction);

    inventoryTable.grantReadWriteData(inventoryFunction);
    inventoryTable.grantReadWriteData(seederFunction);

    timeSeriesTable.grantReadWriteData(dashboardFunction);
    timeSeriesTable.grantReadWriteData(structuralFunction);
    timeSeriesTable.grantReadWriteData(inventoryFunction);
    timeSeriesTable.grantReadWriteData(seederFunction);

    // Grant S3 permissions
    detectionImagesBucket.grantReadWrite(detectionFunction);
    detectionImagesBucket.grantReadWrite(seederFunction);

    // ===========================
    // API Gateway
    // ===========================

    const api = new apigateway.RestApi(this, 'ImiiDomesApi', {
      restApiName: 'IMII Domes Monitoring API',
      description: 'API for IMII Domes structural monitoring system',
      deployOptions: {
        stageName: 'prod',
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // Update with your domain in production
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // API endpoints
    const apiResource = api.root.addResource('api');

    // Dashboard endpoints
    const dashboardResource = apiResource.addResource('dashboard');
    dashboardResource.addMethod('GET', new apigateway.LambdaIntegration(dashboardFunction));
    
    const dashboardSiteResource = dashboardResource.addResource('{site}');
    dashboardSiteResource.addMethod('GET', new apigateway.LambdaIntegration(dashboardFunction));

    const sitesResource = dashboardResource.addResource('sites');
    sitesResource.addMethod('GET', new apigateway.LambdaIntegration(dashboardFunction));

    // Structural endpoints
    const structuralResource = apiResource.addResource('structural');
    const structuralSiteResource = structuralResource.addResource('{site}');
    structuralSiteResource.addMethod('GET', new apigateway.LambdaIntegration(structuralFunction));

    const beamsResource = structuralResource.addResource('beams');
    const beamResource = beamsResource.addResource('{beamId}');
    beamResource.addMethod('PUT', new apigateway.LambdaIntegration(structuralFunction));

    // Detection endpoints
    const detectionsResource = apiResource.addResource('detections');
    const detectionResource = detectionsResource.addResource('{detectionId}');
    detectionResource.addMethod('GET', new apigateway.LambdaIntegration(detectionFunction));
    const resolveResource = detectionResource.addResource('resolve');
    resolveResource.addMethod('POST', new apigateway.LambdaIntegration(detectionFunction));

    // Inventory endpoints
    const inventoryResource = apiResource.addResource('inventory');
    const inventorySiteResource = inventoryResource.addResource('{site}');
    inventorySiteResource.addMethod('GET', new apigateway.LambdaIntegration(inventoryFunction));

    const barnsResource = inventoryResource.addResource('barns');
    const barnResource = barnsResource.addResource('{barnId}');
    barnResource.addMethod('PUT', new apigateway.LambdaIntegration(inventoryFunction));

    // Seeder endpoint (for initial data population)
    const seedResource = apiResource.addResource('seed');
    seedResource.addMethod('POST', new apigateway.LambdaIntegration(seederFunction));

    // ===========================
    // Outputs
    // ===========================

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
      exportName: 'ImiiDomesApiUrl',
    });

    new cdk.CfnOutput(this, 'ImagesBucketName', {
      value: detectionImagesBucket.bucketName,
      description: 'S3 Bucket for detection images',
      exportName: 'ImiiDomesImagesBucket',
    });

    new cdk.CfnOutput(this, 'SitesTableName', {
      value: sitesTable.tableName,
      description: 'DynamoDB Sites Table',
    });

    new cdk.CfnOutput(this, 'BeamsTableName', {
      value: beamsTable.tableName,
      description: 'DynamoDB Beams Table',
    });

    new cdk.CfnOutput(this, 'DetectionsTableName', {
      value: detectionsTable.tableName,
      description: 'DynamoDB Detections Table',
    });

    new cdk.CfnOutput(this, 'InventoryTableName', {
      value: inventoryTable.tableName,
      description: 'DynamoDB Inventory Table',
    });
  }
}
