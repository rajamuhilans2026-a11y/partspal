import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

const app = express();
const port = Number(process.env.PORT) || 4000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

for (const origin of allowedOrigins) {
  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw new Error(`CLIENT_ORIGIN must contain valid absolute origins; received "${origin}".`);
  }
  if (parsedOrigin.origin !== origin) {
    throw new Error(`CLIENT_ORIGIN values must be origins without paths or trailing slashes; received "${origin}".`);
  }
}

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
const kits = [
  {
    id: 'line-follower-kit',
    name: 'Line Follower Kit',
    description: 'Everything needed to build a basic line-following robot.',
    components: [
      { partId: 'arduino-uno', quantity: 1 },
      { partId: 'ir-sensor', quantity: 2 },
      { partId: 'motor-driver-l298n', quantity: 1 },
    ],
  },
];
const issues = [];

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(issue, today = todayUtcDate()) {
  return issue.status === 'active' && issue.dueDate < today;
}

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.includes(origin));
  },
}));
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

  const categoryStock = [...inventory.reduce((totals, part) => {
    const current = totals.get(part.category) ?? {
      category: part.category,
      totalStock: 0,
      availableStock: 0,
    };
    current.totalStock += part.totalStock;
    current.availableStock += part.availableStock;
    totals.set(part.category, current);
    return totals;
  }, new Map()).values()].sort((left, right) => left.category.localeCompare(right.category));

  response.json({
    items,
    categories,
    categoryStock,
    summary: {
      partTypes: inventory.length,
      totalStock: inventory.reduce((total, part) => total + part.totalStock, 0),
      availableStock: inventory.reduce((total, part) => total + part.availableStock, 0),
    },
  });
});

app.get('/api/issues', (request, response) => {
  const { status = 'all', search = '' } = request.query;
  const allowedStatuses = ['all', 'active', 'returned', 'overdue'];

  if (typeof status !== 'string' || !allowedStatuses.includes(status)) {
    return response.status(400).json({
      error: 'Status must be one of: all, active, returned, overdue.',
    });
  }
  if (typeof search !== 'string' || search.length > 100) {
    return response.status(400).json({ error: 'Search must be a string of at most 100 characters.' });
  }

  const today = todayUtcDate();
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredIssues = issues.filter((issue) => {
    const overdue = isOverdue(issue, today);
    const matchesStatus = status === 'all'
      || (status === 'overdue' ? overdue : issue.status === status);
    const matchesMember = !normalizedSearch
      || issue.memberName.toLocaleLowerCase().includes(normalizedSearch)
      || issue.registrationNumber.toLocaleLowerCase().includes(normalizedSearch);
    return matchesStatus && matchesMember;
  });

  response.json({
    issues: filteredIssues
      .map((issue) => ({ ...issue, isOverdue: isOverdue(issue, today) }))
      .reverse(),
    today,
  });
});

app.get('/api/kits', (_request, response) => {
  const responseKits = kits.map((kit) => ({
    ...kit,
    components: kit.components.map((component) => {
      const part = inventory.find((item) => item.id === component.partId);
      return {
        ...component,
        partName: part?.name ?? 'Unknown part',
        availableStock: part?.availableStock ?? 0,
      };
    }),
  }));
  response.json({ kits: responseKits });
});

app.post('/api/issues', (request, response) => {
  const { memberName, registrationNumber, dueDate, partId, kitId, quantity } = request.body ?? {};
  const isKit = kitId !== undefined;
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

  if (isKit) {
    if (typeof kitId !== 'string' || kitId.trim().length === 0) {
      errors.kitId = 'Choose a kit to issue.';
    }
    if (partId !== undefined) {
      errors.kitId = 'Choose either an individual part or a kit, not both.';
    }
  } else {
    if (typeof partId !== 'string' || partId.trim().length === 0) {
      errors.partId = 'Choose a part to issue.';
    }
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      errors.quantity = 'Quantity must be a positive whole number.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({ error: 'Check the issue details and try again.', details: errors });
  }

  let components;
  let kit;
  if (isKit) {
    kit = kits.find((item) => item.id === kitId);
    if (!kit) {
      return response.status(404).json({ error: 'The selected kit does not exist.' });
    }
    components = kit.components.map((component) => {
      const part = inventory.find((item) => item.id === component.partId);
      return part ? {
        partId: part.id,
        partName: part.name,
        quantity: component.quantity,
        part,
      } : null;
    });
    if (components.some((component) => component === null)) {
      console.error(`Kit ${kit.id} references a part missing from inventory.`);
      return response.status(500).json({ error: 'This kit is misconfigured. Contact a lab administrator.' });
    }
    const unavailable = components.filter((component) => component.part.availableStock < component.quantity);
    if (unavailable.length > 0) {
      const shortages = unavailable.map((component) => {
        const available = component.part.availableStock;
        return `${component.partName}: needs ${component.quantity}, only ${available} available`;
      });
      return response.status(409).json({
        error: `Cannot issue ${kit.name}. ${shortages.join('; ')}. No stock was changed.`,
      });
    }
  } else {
    const part = inventory.find((item) => item.id === partId);
    if (!part) {
      return response.status(404).json({ error: 'The selected part does not exist.' });
    }

    if (quantity > part.availableStock) {
      return response.status(409).json({
        error: `Only ${part.availableStock} ${part.name} ${part.availableStock === 1 ? 'unit is' : 'units are'} available.`,
      });
    }
    components = [{
      partId: part.id,
      partName: part.name,
      quantity,
      part,
    }];
  }

  const issue = {
    id: randomUUID(),
    type: isKit ? 'kit' : 'part',
    memberName: memberName.trim(),
    registrationNumber: registrationNumber.trim().toUpperCase(),
    dueDate,
    partId: isKit ? null : components[0].partId,
    partName: isKit ? kit.name : components[0].partName,
    quantity: isKit ? 1 : components[0].quantity,
    kitId: isKit ? kit.id : null,
    kitName: isKit ? kit.name : null,
    components: components.map(({ partId: componentPartId, partName, quantity: componentQuantity }) => ({
      partId: componentPartId,
      partName,
      quantity: componentQuantity,
    })),
    issuedAt: new Date().toISOString(),
    returnedAt: null,
    status: 'active',
  };

  components.forEach((component) => {
    component.part.availableStock -= component.quantity;
  });
  issues.push(issue);

  const message = isKit
    ? `${kit.name} issued to ${issue.memberName}.`
    : `${quantity} ${components[0].partName} ${quantity === 1 ? 'issued' : 'units issued'} to ${issue.memberName}.`;
  return response.status(201).json({ issue, message });
});

app.patch('/api/issues/:id/return', (request, response) => {
  const issue = issues.find((item) => item.id === request.params.id);
  if (!issue) {
    return response.status(404).json({ error: 'Issue not found.' });
  }
  if (issue.status === 'returned') {
    return response.status(409).json({ error: 'This issue has already been returned.' });
  }

  const components = issue.components ?? [{
    partId: issue.partId,
    partName: issue.partName,
    quantity: issue.quantity,
  }];
  const returnParts = components.map((component) => ({
    component,
    part: inventory.find((item) => item.id === component.partId),
  }));
  const missingPart = returnParts.find(({ part }) => !part);
  if (missingPart) {
    console.error(`Cannot return issue ${issue.id}: inventory part ${missingPart.component.partId} no longer exists.`);
    return response.status(500).json({ error: 'An issued part is missing from inventory. Contact a lab administrator.' });
  }
  const exceedsTotal = returnParts.find(({ component, part }) => part.availableStock + component.quantity > part.totalStock);
  if (exceedsTotal) {
    console.error(`Cannot return issue ${issue.id}: returning ${exceedsTotal.component.partName} would exceed its total stock.`);
    return response.status(500).json({ error: 'Returning this issue would exceed recorded stock. Contact a lab administrator.' });
  }

  returnParts.forEach(({ component, part }) => {
    part.availableStock += component.quantity;
  });
  issue.status = 'returned';
  issue.returnedAt = new Date().toISOString();

  return response.json({
    issue,
    message: issue.type === 'kit'
      ? `${issue.kitName} returned by ${issue.memberName}.`
      : `${issue.partName} returned by ${issue.memberName}.`,
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
