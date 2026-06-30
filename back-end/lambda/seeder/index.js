const { docClient, PutCommand, response, errorResponse } = require('/opt/nodejs/utils');

const SITES_TABLE = process.env.SITES_TABLE;
const BEAMS_TABLE = process.env.BEAMS_TABLE;
const DETECTIONS_TABLE = process.env.DETECTIONS_TABLE;
const INVENTORY_TABLE = process.env.INVENTORY_TABLE;
const TIMESERIES_TABLE = process.env.TIMESERIES_TABLE;

const sites = [
  'Nutrien Allan',
  'Nutrien Lanigan',
  'Nutrien Cory',
  'Nutrien Rocanville',
  'Mosaic Esterhazy',
];

const beamData = {
  'Nutrien Allan': [
    { id: 'B-01', location: 'Barn 1 - North', status: 'good', stress: 45, lastInspection: '2026-03-15' },
    { id: 'B-02', location: 'Barn 1 - South', status: 'good', stress: 42, lastInspection: '2026-03-15' },
    { id: 'B-03', location: 'Barn 2 - North', status: 'good', stress: 48, lastInspection: '2026-03-20' },
    { id: 'B-04', location: 'Barn 2 - South', status: 'good', stress: 51, lastInspection: '2026-03-20' },
    { id: 'B-05', location: 'Barn 3 - North', status: 'warning', stress: 68, lastInspection: '2026-03-10' },
    { id: 'B-06', location: 'Barn 3 - South', status: 'good', stress: 44, lastInspection: '2026-03-25' },
    { id: 'B-07', location: 'Barn 4 - North', status: 'warning', stress: 72, lastInspection: '2026-03-05' },
    { id: 'B-08', location: 'Barn 4 - South', status: 'good', stress: 39, lastInspection: '2026-03-25' },
  ],
  'Nutrien Lanigan': [
    { id: 'B-11', location: 'Barn 1 - North', status: 'good', stress: 42, lastInspection: '2026-03-20' },
    { id: 'B-12', location: 'Barn 1 - South', status: 'good', stress: 40, lastInspection: '2026-03-20' },
    { id: 'B-13', location: 'Barn 2 - North', status: 'good', stress: 46, lastInspection: '2026-03-22' },
    { id: 'B-14', location: 'Barn 2 - South', status: 'good', stress: 48, lastInspection: '2026-03-22' },
    { id: 'B-15', location: 'Barn 3 - North', status: 'good', stress: 44, lastInspection: '2026-03-25' },
    { id: 'B-16', location: 'Barn 3 - South', status: 'good', stress: 45, lastInspection: '2026-03-25' },
    { id: 'B-17', location: 'Barn 4 - North', status: 'warning', stress: 67, lastInspection: '2026-03-10' },
    { id: 'B-18', location: 'Barn 4 - South', status: 'good', stress: 41, lastInspection: '2026-03-26' },
    { id: 'B-19', location: 'Barn 5 - North', status: 'good', stress: 43, lastInspection: '2026-03-26' },
    { id: 'B-20', location: 'Barn 5 - South', status: 'good', stress: 47, lastInspection: '2026-03-26' },
  ],
  'Nutrien Cory': [
    { id: 'B-21', location: 'Barn 1 - North', status: 'good', stress: 47, lastInspection: '2026-03-15' },
    { id: 'B-22', location: 'Barn 1 - South', status: 'good', stress: 44, lastInspection: '2026-03-15' },
    { id: 'B-23', location: 'Barn 2 - North', status: 'warning', stress: 70, lastInspection: '2026-03-08' },
    { id: 'B-24', location: 'Barn 2 - South', status: 'good', stress: 50, lastInspection: '2026-03-20' },
    { id: 'B-25', location: 'Barn 3 - North', status: 'warning', stress: 69, lastInspection: '2026-03-08' },
    { id: 'B-26', location: 'Barn 3 - South', status: 'good', stress: 46, lastInspection: '2026-03-25' },
    { id: 'B-27', location: 'Barn 4 - North', status: 'warning', stress: 73, lastInspection: '2026-03-05' },
    { id: 'B-28', location: 'Barn 4 - South', status: 'good', stress: 41, lastInspection: '2026-03-25' },
    { id: 'B-29', location: 'Barn 5 - North', status: 'good', stress: 45, lastInspection: '2026-03-24' },
    { id: 'B-30', location: 'Barn 5 - South', status: 'good', stress: 43, lastInspection: '2026-03-24' },
    { id: 'B-31', location: 'Barn 6 - North', status: 'good', stress: 48, lastInspection: '2026-03-23' },
    { id: 'B-32', location: 'Barn 6 - South', status: 'good', stress: 42, lastInspection: '2026-03-23' },
  ],
  'Nutrien Rocanville': [
    { id: 'B-33', location: 'Barn 1 - North', status: 'good', stress: 43, lastInspection: '2026-03-18' },
    { id: 'B-34', location: 'Barn 1 - South', status: 'good', stress: 41, lastInspection: '2026-03-18' },
    { id: 'B-35', location: 'Barn 2 - North', status: 'good', stress: 47, lastInspection: '2026-03-22' },
    { id: 'B-36', location: 'Barn 2 - South', status: 'good', stress: 49, lastInspection: '2026-03-22' },
    { id: 'B-37', location: 'Barn 3 - North', status: 'warning', stress: 66, lastInspection: '2026-03-12' },
    { id: 'B-38', location: 'Barn 3 - South', status: 'good', stress: 42, lastInspection: '2026-03-26' },
    { id: 'B-39', location: 'Barn 4 - North', status: 'good', stress: 45, lastInspection: '2026-03-26' },
    { id: 'B-40', location: 'Barn 4 - South', status: 'good', stress: 40, lastInspection: '2026-03-27' },
  ],
  'Mosaic Esterhazy': [
    { id: 'B-41', location: 'Barn 1 - North', status: 'good', stress: 46, lastInspection: '2026-03-16' },
    { id: 'B-42', location: 'Barn 1 - South', status: 'good', stress: 44, lastInspection: '2026-03-16' },
    { id: 'B-43', location: 'Barn 2 - North', status: 'good', stress: 49, lastInspection: '2026-03-21' },
    { id: 'B-44', location: 'Barn 2 - South', status: 'good', stress: 52, lastInspection: '2026-03-21' },
    { id: 'B-45', location: 'Barn 3 - North', status: 'warning', stress: 71, lastInspection: '2026-03-09' },
    { id: 'B-46', location: 'Barn 3 - South', status: 'good', stress: 47, lastInspection: '2026-03-24' },
    { id: 'B-47', location: 'Barn 4 - North', status: 'warning', stress: 69, lastInspection: '2026-03-07' },
    { id: 'B-48', location: 'Barn 4 - South', status: 'good', stress: 43, lastInspection: '2026-03-24' },
    { id: 'B-49', location: 'Barn 5 - North', status: 'good', stress: 46, lastInspection: '2026-03-23' },
    { id: 'B-50', location: 'Barn 5 - South', status: 'good', stress: 44, lastInspection: '2026-03-23' },
  ],
};

const inventoryData = {
  'Nutrien Allan': [
    { id: 1, name: 'Barn 1', current: 2450, capacity: 3000, status: 'good', change: '+120' },
    { id: 2, name: 'Barn 2', current: 2100, capacity: 2500, status: 'good', change: '+85' },
    { id: 3, name: 'Barn 3', current: 1900, capacity: 2000, status: 'warning', change: '-150' },
    { id: 4, name: 'Barn 4', current: 2000, capacity: 2500, status: 'good', change: '+200' },
  ],
  'Nutrien Lanigan': [
    { id: 5, name: 'Barn 1', current: 2600, capacity: 2800, status: 'good', change: '+80' },
    { id: 6, name: 'Barn 2', current: 2400, capacity: 2600, status: 'good', change: '+45' },
    { id: 7, name: 'Barn 3', current: 2100, capacity: 2300, status: 'good', change: '+30' },
    { id: 8, name: 'Barn 4', current: 2100, capacity: 2300, status: 'good', change: '+25' },
  ],
  'Nutrien Cory': [
    { id: 9, name: 'Barn 1', current: 2200, capacity: 2800, status: 'good', change: '+50' },
    { id: 10, name: 'Barn 2', current: 1900, capacity: 2500, status: 'good', change: '+30' },
    { id: 11, name: 'Barn 3', current: 1800, capacity: 2200, status: 'warning', change: '+20' },
    { id: 12, name: 'Barn 4', current: 1900, capacity: 2500, status: 'good', change: '+20' },
  ],
  'Nutrien Rocanville': [
    { id: 13, name: 'Barn 1', current: 2500, capacity: 2800, status: 'good', change: '+90' },
    { id: 14, name: 'Barn 2', current: 2300, capacity: 2600, status: 'good', change: '+65' },
    { id: 15, name: 'Barn 3', current: 2000, capacity: 2300, status: 'good', change: '+35' },
    { id: 16, name: 'Barn 4', current: 2100, capacity: 2300, status: 'good', change: '+25' },
  ],
  'Mosaic Esterhazy': [
    { id: 17, name: 'Barn 1', current: 2300, capacity: 2800, status: 'good', change: '+70' },
    { id: 18, name: 'Barn 2', current: 2000, capacity: 2500, status: 'good', change: '+40' },
    { id: 19, name: 'Barn 3', current: 1850, capacity: 2200, status: 'warning', change: '+15' },
    { id: 20, name: 'Barn 4', current: 1950, capacity: 2500, status: 'good', change: '+20' },
  ],
};

const detectionData = {
  'Nutrien Allan': [
    { id: 1, type: 'Bird Droppings', location: 'Barn 2 - Section A', severity: 'medium', timestamp: '2026-03-29T08:15:42Z', status: 'active', cameraId: 'CAM-2A' },
    { id: 2, type: 'Seeds', location: 'Barn 3 - Section C', severity: 'low', timestamp: '2026-03-29T07:42:11Z', status: 'active', cameraId: 'CAM-3C' },
    { id: 3, type: 'Bird Droppings', location: 'Barn 1 - Section B', severity: 'high', timestamp: '2026-03-29T06:30:05Z', status: 'active', cameraId: 'CAM-1B' },
    { id: 4, type: 'Dust Accumulation', location: 'Barn 4 - Section A', severity: 'low', timestamp: '2026-03-28T22:15:30Z', status: 'resolved', cameraId: 'CAM-4A', resolvedAt: '2026-03-29T08:00:00Z' },
    { id: 5, type: 'Seeds', location: 'Barn 2 - Section D', severity: 'low', timestamp: '2026-03-28T18:45:17Z', status: 'resolved', cameraId: 'CAM-2D', resolvedAt: '2026-03-29T07:30:00Z' },
    { id: 6, type: 'Bird Droppings', location: 'Barn 3 - Section B', severity: 'medium', timestamp: '2026-03-28T14:20:58Z', status: 'resolved', cameraId: 'CAM-3B', resolvedAt: '2026-03-29T06:00:00Z' },
  ],
  'Nutrien Lanigan': [
    { id: 11, type: 'Seeds', location: 'Barn 2 - Section A', severity: 'low', timestamp: '2026-03-29T09:15:00Z', status: 'active', cameraId: 'CAM-12A' },
    { id: 12, type: 'Dust Accumulation', location: 'Barn 3 - Section B', severity: 'low', timestamp: '2026-03-29T08:30:00Z', status: 'active', cameraId: 'CAM-13B' },
  ],
  'Nutrien Cory': [
    { id: 21, type: 'Bird Droppings', location: 'Barn 2 - Section A', severity: 'high', timestamp: '2026-03-29T10:00:00Z', status: 'active', cameraId: 'CAM-22A' },
    { id: 22, type: 'Seeds', location: 'Barn 3 - Section C', severity: 'medium', timestamp: '2026-03-29T09:30:00Z', status: 'active', cameraId: 'CAM-23C' },
    { id: 23, type: 'Dust Accumulation', location: 'Barn 1 - Section B', severity: 'low', timestamp: '2026-03-29T08:45:00Z', status: 'active', cameraId: 'CAM-21B' },
    { id: 24, type: 'Bird Droppings', location: 'Barn 4 - Section D', severity: 'medium', timestamp: '2026-03-29T08:00:00Z', status: 'active', cameraId: 'CAM-24D' },
  ],
  'Nutrien Rocanville': [
    { id: 31, type: 'Seeds', location: 'Barn 1 - Section A', severity: 'low', timestamp: '2026-03-29T07:45:00Z', status: 'active', cameraId: 'CAM-31A' },
  ],
  'Mosaic Esterhazy': [
    { id: 41, type: 'Bird Droppings', location: 'Barn 2 - Section A', severity: 'high', timestamp: '2026-03-29T11:00:00Z', status: 'active', cameraId: 'CAM-42A' },
    { id: 42, type: 'Seeds', location: 'Barn 3 - Section C', severity: 'medium', timestamp: '2026-03-29T10:30:00Z', status: 'active', cameraId: 'CAM-43C' },
    { id: 43, type: 'Dust Accumulation', location: 'Barn 1 - Section B', severity: 'low', timestamp: '2026-03-29T10:00:00Z', status: 'active', cameraId: 'CAM-41B' },
    { id: 44, type: 'Bird Droppings', location: 'Barn 4 - Section D', severity: 'high', timestamp: '2026-03-29T09:30:00Z', status: 'active', cameraId: 'CAM-44D' },
    { id: 45, type: 'Seeds', location: 'Barn 5 - Section A', severity: 'medium', timestamp: '2026-03-29T09:00:00Z', status: 'active', cameraId: 'CAM-45A' },
  ],
};

exports.handler = async (event) => {
  console.log('Starting data seeding...');

  try {
    let seedCount = 0;

    // Seed Sites
    for (const site of sites) {
      await docClient.send(
        new PutCommand({
          TableName: SITES_TABLE,
          Item: {
            siteId: site,
            name: site,
            createdAt: Date.now(),
          },
        })
      );
      seedCount++;
      console.log(`Seeded site: ${site}`);
    }

    // Seed Beams
    for (const site of sites) {
      const beams = beamData[site] || [];
      for (const beam of beams) {
        await docClient.send(
          new PutCommand({
            TableName: BEAMS_TABLE,
            Item: {
              siteId: site,
              beamId: beam.id,
              location: beam.location,
              status: beam.status,
              stress: beam.stress,
              lastInspection: beam.lastInspection,
              createdAt: Date.now(),
            },
          })
        );
        seedCount++;
      }
      console.log(`Seeded ${beams.length} beams for ${site}`);
    }

    // Seed Inventory
    for (const site of sites) {
      const barns = inventoryData[site] || [];
      for (const barn of barns) {
        await docClient.send(
          new PutCommand({
            TableName: INVENTORY_TABLE,
            Item: {
              siteId: site,
              barnId: barn.id.toString(),
              name: barn.name,
              current: barn.current,
              capacity: barn.capacity,
              status: barn.status,
              change: barn.change,
              createdAt: Date.now(),
            },
          })
        );
        seedCount++;
      }
      console.log(`Seeded ${barns.length} barns for ${site}`);
    }

    // Seed Detections
    for (const site of sites) {
      const detections = detectionData[site] || [];
      for (const detection of detections) {
        await docClient.send(
          new PutCommand({
            TableName: DETECTIONS_TABLE,
            Item: {
              siteId: site,
              detectionId: detection.id.toString(),
              type: detection.type,
              location: detection.location,
              severity: detection.severity,
              timestamp: detection.timestamp,
              status: detection.status,
              cameraId: detection.cameraId,
              resolvedAt: detection.resolvedAt,
              createdAt: Date.now(),
            },
          })
        );
        seedCount++;
      }
      console.log(`Seeded ${detections.length} detections for ${site}`);
    }

    // Seed Time Series Data (last 7 days)
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (const site of sites) {
      // Seed stress time series
      for (let i = 6; i >= 0; i--) {
        const timestamp = now - i * oneDayMs;
        await docClient.send(
          new PutCommand({
            TableName: TIMESERIES_TABLE,
            Item: {
              metricKey: `${site}#stress`,
              timestamp,
              beam1: 60 + Math.random() * 12,
              beam2: 65 + Math.random() * 8,
              average: 45 + Math.random() * 5,
              ttl: Math.floor((now + 90 * oneDayMs) / 1000),
            },
          })
        );
        seedCount++;
      }

      // Seed detection time series
      for (let i = 6; i >= 0; i--) {
        const timestamp = now - i * oneDayMs;
        await docClient.send(
          new PutCommand({
            TableName: TIMESERIES_TABLE,
            Item: {
              metricKey: `${site}#detections`,
              timestamp,
              seeds: Math.floor(Math.random() * 5) + 1,
              droppings: Math.floor(Math.random() * 6) + 2,
              dust: Math.floor(Math.random() * 4),
              ttl: Math.floor((now + 90 * oneDayMs) / 1000),
            },
          })
        );
        seedCount++;
      }

      // Seed inventory time series
      const barns = inventoryData[site] || [];
      const baseInventory = barns.reduce((sum, b) => sum + b.current, 0);
      for (let i = 6; i >= 0; i--) {
        const timestamp = now - i * oneDayMs;
        const variation = Math.floor(Math.random() * 100) - 50;
        await docClient.send(
          new PutCommand({
            TableName: TIMESERIES_TABLE,
            Item: {
              metricKey: `${site}#inventory`,
              timestamp,
              total: baseInventory + variation - (6 - i) * 10,
              ttl: Math.floor((now + 90 * oneDayMs) / 1000),
            },
          })
        );
        seedCount++;
      }

      console.log(`Seeded time series data for ${site}`);
    }

    console.log(`Seeding complete! Total records seeded: ${seedCount}`);

    return response(200, {
      message: 'Data seeding completed successfully',
      totalRecords: seedCount,
      sites: sites.length,
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return errorResponse(500, `Seeding failed: ${error.message}`);
  }
};
