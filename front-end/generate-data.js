const fs = require('fs');

const generateGlulamTelemetry = (days) => {
  const data = [];
  const baseLoad = 45.0;
  let damageOffset = 0;

  for (let i = days; i >= 0; i--) {
    const t = days - i + 1;
    
    if (Math.random() > 0.99) damageOffset += (Math.random() * 2);

    const creep = 1.5 * Math.pow(t, 0.25);
    const seasonal = 2.0 * Math.sin((2 * Math.PI / 365) * t);
    const noise = (Math.random() - 0.5) * 0.8;
    const simulatedStress = baseLoad + creep + seasonal + noise + damageOffset;

    data.push({
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      average: parseFloat(simulatedStress.toFixed(2)),
      beam1: parseFloat((simulatedStress + 2.1).toFixed(2)),
      beam2: parseFloat((simulatedStress - 1.4).toFixed(2))
    });
  }
  return data;
};

// Write to a static JSON file
const payload = generateGlulamTelemetry(730);
fs.writeFileSync('./src/data/telemetry.json', JSON.stringify(payload, null, 2));
console.log('Generated 730 days of telemetry data.');
