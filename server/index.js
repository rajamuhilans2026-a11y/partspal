import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

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
const issues = [];

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

app.get('/api/issues', (_request, response) => {
  response.json({ issues: [...issues].reverse() });
});

app.post('/api/issues', (request, response) => {
  const { memberName, registrationNumber, dueDate, partId, quantity } = request.body ?? {};
  const errors = {};

  if (typeof memberName !== 'string' || memberName.trim().length < 2 || memberName.trim().length > 80) {
    errors.memberName = 'Enter a member name between 2 and 80 characters.';
  }

  if (
    typeof registrationNumber !== 'string'
    || !/^[a-zA-Z0-9-]{3,20}$/.test(registrationNumber.trim())
  ) {
    errors.registrationNumber = 'Enter a registration number using 3–20 letters, numbers, or hyphens.';
  }

  const validDateFormat = typeof dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDate);
  const parsedDueDate = validDateFormat ? new Date(`${dueDate}T00:00:00.000Z`) : null;
  const isRealDate = parsedDueDate && !Number.isNaN(parsedDueDate.getTime())
    && parsedDueDate.toISOString().slice(0, 10) === dueDate;
  const today = new Date().toISOString().slice(0, 10);
  if (!isRealDate || dueDate < today) {
    errors.dueDate = 'Choose a valid due date that is today or later.';
  }

  if (typeof partId !== 'string' || partId.trim().length === 0) {
    errors.partId = 'Choose a part to issue.';
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    errors.quantity = 'Quantity must be a positive whole number.';
  }

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({ error: 'Check the issue details and try again.', details: errors });
  }

  const part = inventory.find((item) => item.id === partId);
  if (!part) {
    return response.status(404).json({ error: 'The selected part does not exist.' });
  }

  if (quantity > part.availableStock) {
    return response.status(409).json({
      error: `Only ${part.availableStock} ${part.name} ${part.availableStock === 1 ? 'unit is' : 'units are'} available.`,
    });
  }

  const issue = {
    id: randomUUID(),
    memberName: memberName.trim(),
    registrationNumber: registrationNumber.trim().toUpperCase(),
    dueDate,
    partId: part.id,
    partName: part.name,
    quantity,
    issuedAt: new Date().toISOString(),
    returnedAt: null,
    status: 'active',
  };

  part.availableStock -= quantity;
  issues.push(issue);

  return response.status(201).json({ issue, message: `${quantity} ${part.name} ${quantity === 1 ? 'issued' : 'units issued'} to ${issue.memberName}.` });
});

app.patch('/api/issues/:id/return', (request, response) => {
  const issue = issues.find((item) => item.id === request.params.id);
  if (!issue) {
    return response.status(404).json({ error: 'Issue not found.' });
  }
  if (issue.status === 'returned') {
    return response.status(409).json({ error: 'This issue has already been returned.' });
  }

  const part = inventory.find((item) => item.id === issue.partId);
  if (!part) {
    console.error(`Cannot return issue ${issue.id}: inventory part ${issue.partId} no longer exists.`);
    return response.status(500).json({ error: 'The issued part is missing from inventory. Contact a lab administrator.' });
  }

  part.availableStock += issue.quantity;
  issue.status = 'returned';
  issue.returnedAt = new Date().toISOString();

  return response.json({ issue, message: `${issue.partName} returned by ${issue.memberName}.` });
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
