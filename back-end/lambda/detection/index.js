const { docClient, QueryCommand, UpdateCommand, response, errorResponse } = require('/opt/nodejs/utils');

const DETECTIONS_TABLE = process.env.DETECTIONS_TABLE;
const TIMESERIES_TABLE = process.env.TIMESERIES_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const path = event.path || event.resource;
  const httpMethod = event.httpMethod;
  const pathParameters = event.pathParameters || {};

  try {
    // GET /api/detections/{site} - Get detection data for a site
    if (pathParameters.detectionId && httpMethod === 'GET') {
      const site = decodeURIComponent(pathParameters.detectionId);

      // Get all detections for the site
      const detectionsResult = await docClient.send(
        new QueryCommand({
          TableName: DETECTIONS_TABLE,
          KeyConditionExpression: 'siteId = :siteId',
          ExpressionAttributeValues: {
            ':siteId': site,
          },
        })
      );

      const detections = detectionsResult.Items || [];
      const activeAlerts = detections.filter((d) => d.status === 'active').length;
      
      // Count resolved today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const resolvedToday = detections.filter(
        (d) => d.status === 'resolved' && new Date(d.resolvedAt) >= today
      ).length;

      // Get weekly data from time series
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      const weeklyDataResult = await docClient.send(
        new QueryCommand({
          TableName: TIMESERIES_TABLE,
          KeyConditionExpression: 'metricKey = :metricKey AND #ts >= :startTime',
          ExpressionAttributeNames: {
            '#ts': 'timestamp',
          },
          ExpressionAttributeValues: {
            ':metricKey': `${site}#detections`,
            ':startTime': sevenDaysAgo,
          },
        })
      );

      const weeklyData = (weeklyDataResult.Items || []).map((item) => ({
        day: new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
        seeds: item.seeds || 0,
        droppings: item.droppings || 0,
        dust: item.dust || 0,
      }));

      return response(200, {
        activeAlerts,
        resolvedToday,
        cameras: 16, // Static for now
        accuracy: '98.5%', // Static for now
        detections: detections.map((d) => ({
          id: parseInt(d.detectionId),
          type: d.type,
          location: d.location,
          severity: d.severity,
          timestamp: d.timestamp,
          status: d.status,
          imageUrl: d.imageUrl,
          cameraId: d.cameraId,
        })),
        weeklyData,
      });
    }

    // POST /api/detections/{detectionId}/resolve - Resolve a detection
    if (path.includes('/resolve') && httpMethod === 'POST') {
      const detectionId = pathParameters.detectionId;
      const body = JSON.parse(event.body || '{}');
      const { siteId } = body;

      if (!siteId) {
        return errorResponse(400, 'Missing required field: siteId');
      }

      await docClient.send(
        new UpdateCommand({
          TableName: DETECTIONS_TABLE,
          Key: { siteId, detectionId },
          UpdateExpression: 'SET #status = :status, resolvedAt = :resolvedAt',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':status': 'resolved',
            ':resolvedAt': new Date().toISOString(),
          },
        })
      );

      return response(200, { message: 'Detection resolved successfully' });
    }

    return errorResponse(404, 'Not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, error.message);
  }
};
