const { docClient, QueryCommand, UpdateCommand, response, errorResponse } = require('/opt/nodejs/utils');

const BEAMS_TABLE = process.env.BEAMS_TABLE;
const TIMESERIES_TABLE = process.env.TIMESERIES_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const path = event.path || event.resource;
  const httpMethod = event.httpMethod;
  const pathParameters = event.pathParameters || {};

  try {
    // GET /api/structural/{site} - Get structural data for a site
    if (pathParameters.site && httpMethod === 'GET') {
      const site = decodeURIComponent(pathParameters.site);

      // Get all beams for the site
      const beamsResult = await docClient.send(
        new QueryCommand({
          TableName: BEAMS_TABLE,
          KeyConditionExpression: 'siteId = :siteId',
          ExpressionAttributeValues: {
            ':siteId': site,
          },
        })
      );

      const beams = beamsResult.Items || [];
      const totalBeams = beams.length;
      const healthy = beams.filter((b) => b.status === 'good').length;
      const warning = beams.filter((b) => b.status === 'warning').length;

      // Get stress time series data
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      const stressDataResult = await docClient.send(
        new QueryCommand({
          TableName: TIMESERIES_TABLE,
          KeyConditionExpression: 'metricKey = :metricKey AND #ts >= :startTime',
          ExpressionAttributeNames: {
            '#ts': 'timestamp',
          },
          ExpressionAttributeValues: {
            ':metricKey': `${site}#stress`,
            ':startTime': sevenDaysAgo,
          },
        })
      );

      const stressData = stressDataResult.Items || [];

      // Format stress data for chart
      const formattedStressData = stressData.map((item) => ({
        date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        beam1: item.beam1 || null,
        beam2: item.beam2 || null,
        average: item.average || 0,
      }));

      return response(200, {
        totalBeams,
        healthy,
        warning,
        beams: beams.map((b) => ({
          id: b.beamId,
          location: b.location,
          status: b.status,
          stress: b.stress,
          lastInspection: b.lastInspection,
        })),
        stressData: formattedStressData,
      });
    }

    // PUT /api/structural/beams/{beamId} - Update beam status
    if (path.includes('/beams/') && httpMethod === 'PUT') {
      const beamId = pathParameters.beamId;
      const body = JSON.parse(event.body || '{}');
      const { status, siteId } = body;

      if (!status || !siteId) {
        return errorResponse(400, 'Missing required fields: status, siteId');
      }

      await docClient.send(
        new UpdateCommand({
          TableName: BEAMS_TABLE,
          Key: { siteId, beamId },
          UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':status': status,
            ':updatedAt': Date.now(),
          },
        })
      );

      return response(200, { message: 'Beam status updated successfully' });
    }

    return errorResponse(404, 'Not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, error.message);
  }
};
