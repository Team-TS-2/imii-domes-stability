const { docClient, QueryCommand, response, errorResponse } = require('/opt/nodejs/utils');

const SITES_TABLE = process.env.SITES_TABLE;
const BEAMS_TABLE = process.env.BEAMS_TABLE;
const DETECTIONS_TABLE = process.env.DETECTIONS_TABLE;
const INVENTORY_TABLE = process.env.INVENTORY_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const path = event.path || event.resource;
  const httpMethod = event.httpMethod;
  const pathParameters = event.pathParameters || {};

  try {
    // GET /api/dashboard/sites - List all sites
    if (path.includes('/sites') && httpMethod === 'GET') {
      const sites = [
        'Nutrien Allan',
        'Nutrien Lanigan',
        'Nutrien Cory',
        'Nutrien Rocanville',
        'Mosaic Esterhazy',
      ];
      return response(200, sites);
    }

    // GET /api/dashboard/{site} - Get dashboard data for a site
    if (pathParameters.site && httpMethod === 'GET') {
      const site = decodeURIComponent(pathParameters.site);

      // Get beam count
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
      const beamsInspection = beams.filter((b) => b.status === 'warning').length;

      // Get foreign alerts count
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
      const foreignAlerts = detections.filter((d) => d.status === 'active').length;

      // Get inventory
      const inventoryResult = await docClient.send(
        new QueryCommand({
          TableName: INVENTORY_TABLE,
          KeyConditionExpression: 'siteId = :siteId',
          ExpressionAttributeValues: {
            ':siteId': site,
          },
        })
      );

      const inventory = inventoryResult.Items || [];
      const totalInventory = inventory.reduce((sum, barn) => sum + barn.current, 0);
      const totalCapacity = inventory.reduce((sum, barn) => sum + barn.capacity, 0);
      const capacity = `${Math.round((totalInventory / totalCapacity) * 100)}%`;

      // Calculate structural health based on beam stress
      const avgStress = beams.reduce((sum, b) => sum + b.stress, 0) / beams.length;
      const structuralHealth = `${Math.round(100 - avgStress / 2)}%`;

      return response(200, {
        structuralHealth,
        beamsInspection,
        foreignAlerts,
        inventory: `${totalInventory.toLocaleString()} tons`,
        capacity,
      });
    }

    return errorResponse(404, 'Not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, error.message);
  }
};
