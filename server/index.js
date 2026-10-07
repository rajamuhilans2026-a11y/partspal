import express from 'express';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT) || 4000;

const inventory = [
  { id: 'arduino-uno', name: 'Arduino Uno', category: 'Microcontrollers', totalStock: 12, availableStock: 12 },
  { id: 'arduino-nano', name: 'Arduino Nano', category: 'Microcontrollers', totalStock: 8, availableStock: 8 },
  { id: 'esp32-devkit', name: 'ESP32 DevKit', category: 'Microcontrollers', totalStock: 10, availableStock: 10 },
  { id: 'ir-sensor', name: 'IR Sensor', category: 'Sensors', totalStock: 18, availableStock: 18 },
  { id: 'ultrasonic-sensor', name: 'Ultrasonic Sensor', category: 'Sensors', totalStock: 14, availableStock: 14 },
  { id: 'imu-mpu6050', name: 'MPU6050 IMU', category: 'Sensors', totalStock: 6, availableStock: 6 },
  { id: 'motor-driver-l298n', name: 'L298N Motor Driver', category: 'Motors & Drivers', totalStock: 8, availableStock: 8 },
  { id: 'motor-driver-l293d', name: 'L293D Motor Driver', category: 'Motors & Drivers', totalStock: 5, availableStock: 5 },
  { id: 'dc-geared-motor', name: 'DC Geared Motor', category: 'Motors & Drivers', totalStock: 16, availableStock: 16 },
  { id: 'servo-sg90', name: 'SG90 Servo Motor', category: 'Motors & Drivers', totalStock: 9, availableStock: 9 },
  { id: 'battery-9v', name: '9V Battery', category: 'Power', totalStock: 20, availableStock: 20 },
  { id: 'chassis-2wd', name: '2WD Robot Chassis', category: 'Chassis & Hardware', totalStock: 7, availableStock: 7 },
  { id: 'jumper-wire-kit', name: 'Jumper Wire Kit', category: 'Chassis & Hardware', totalStock: 15, availableStock: 15 },
];

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    message: 'Backend is connected and ready.',
    app: 'PartsPal',
  });
});

app.get('/api/inventory', (request, response) => {
  const { search = '', category = '' } = request.query;

  if (typeof search !== 'string' || search.length > 100) {
    return response.status(400).json({ error: 'Search must be a string of at most 100 characters.' });
  }

  if (typeof category !== 'string') {
    return response.status(400).json({ error: 'Category must be a single category name.' });
  }

  const categories = [...new Set(inventory.map((part) => part.category))].sort();
  if (category && !categories.includes(category)) {
    return response.status(400).json({ error: 'Choose a category from the available inventory categories.' });
  }

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const items = inventory.filter((part) => {
    const matchesSearch = !normalizedSearch
      || part.name.toLocaleLowerCase().includes(normalizedSearch)
      || part.category.toLocaleLowerCase().includes(normalizedSearch);
    const matchesCategory = !category || part.category === category;
    return matchesSearch && matchesCategory;
  });

  response.json({
    items,
    categories,
    summary: {
      partTypes: inventory.length,
      totalStock: inventory.reduce((total, part) => total + part.totalStock, 0),
      availableStock: inventory.reduce((total, part) => total + part.availableStock, 0),
    },
  });
});

app.use((request, response) => {
  response.status(404).json({ error: `Route not found: ${request.method} ${request.path}` });
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({ error: 'Request body must contain valid JSON.' });
  }

  console.error('Unhandled API error:', error);
  return response.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(port, () => {
  console.log(`PartsPal API listening on port ${port}`);
});
