const { docClient, QueryCommand, UpdateCommand, response, errorResponse } = require('/opt/nodejs/utils');

const INVENTORY_TABLE = process.env.INVENTORY_TABLE;
const TIMESERIES_TABLE = process.env.TIMESERIES_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const path = event.path || event.resource;
  const httpMethod = event.httpMethod;
  const pathParameters = event.pathParameters || {};

  try {
    // GET /api/inventory/{site} - Get inventory data for a site
    if (pathParameters.site && httpMethod === 'GET') {
      const site = decodeURIComponent(pathParameters.site);

      // Get all barns for the site
      const inventoryResult = await docClient.send(
        new QueryCommand({
          TableName: INVENTORY_TABLE,
          KeyConditionExpression: 'siteId = :siteId',
          ExpressionAttributeValues: {
            ':siteId': site,
          },
        })
      );

      const barns = inventoryResult.Items || [];
      const totalInventory = barns.reduce((sum, barn) => sum + barn.current, 0);
      const totalCapacity = barns.reduce((sum, barn) => sum + barn.capacity, 0);
      const totalChange = barns.reduce((sum, barn) => sum + parseInt(barn.change.replace('+', '')), 0);

      // Get volume time series data
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      const volumeDataResult = await docClient.send(
        new QueryCommand({
          TableName: TIMESERIES_TABLE,
          KeyConditionExpression: 'metricKey = :metricKey AND #ts >= :startTime',
          ExpressionAttributeNames: {
            '#ts': 'timestamp',
          },
          ExpressionAttributeValues: {
            ':metricKey': `${site}#inventory`,
            ':startTime': sevenDaysAgo,
          },
        })
      );

      const volumeData = (volumeDataResult.Items || []).map((item) => ({
        date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: item.total || 0,
      }));

      // Calculate average daily change
      const avgDailyChange = Math.round(totalChange / 7);

      return response(200, {
        totalInventory: `${totalInventory.toLocaleString()} tons`,
        totalChange: `+${totalChange}`,
        totalCapacity,
        avgDailyChange: `+${avgDailyChange}`,
        barns: barns.map((b) => ({
          id: parseInt(b.barnId),
          name: b.name,
          current: b.current,
          capacity: b.capacity,
          status: b.status,
          change: b.change,
        })),
        volumeData,
      });
    }

    // PUT /api/inventory/barns/{barnId} - Update barn inventory
    if (path.includes('/barns/') && httpMethod === 'PUT') {
      const barnId = pathParameters.barnId;
      const body = JSON.parse(event.body || '{}');
      const { amount, siteId } = body;

      if (amount === undefined || !siteId) {
        return errorResponse(400, 'Missing required fields: amount, siteId');
      }

      await docClient.send(
        new UpdateCommand({
          TableName: INVENTORY_TABLE,
          Key: { siteId, barnId },
          UpdateExpression: 'SET current = current + :amount, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':amount': amount,
            ':updatedAt': Date.now(),
          },
        })
      );

      return response(200, { message: 'Barn inventory updated successfully' });
    }

    return errorResponse(404, 'Not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, error.message);
  }
};
