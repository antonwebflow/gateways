import express from 'express';
import { body, validationResult } from 'express-validator';
import morgan from 'morgan';
import Gateway from './models/Gateway.js';
import connectDB from './db.js';

connectDB();
const app = express();
app.use(express.json());
app.use(morgan('combined'));

app.get('/gateways', async (req, res) => {
  try {
    const gateways = await Gateway.find();
    res.json(gateways);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/gateways/:id', async (req, res) => {
  try {
    const gateway = await Gateway.findById(req.params.id);
    if (!gateway) {
      res.status(404).json({ message: 'Gateway not found' });
      return;
    }
    res.json(gateway);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/gateways', [
  body('serial').isString().notEmpty(),
  body('name').isString().notEmpty(),
  body('address').isIP(),
  body('devices.*.uid').isNumeric(),
  body('devices.*.vendor').isString().notEmpty(),
  body('devices.*.status').isIn(['online', 'offline']),
  body('devices').custom((devices) => {
    if (devices && devices.length > 10) {
      throw new Error('No more than 10 devices are allowed for a gateway');
    }
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const gateway = new Gateway(req.body);
  try {
    await gateway.save();
    res.status(201).json(gateway);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.post('/gateways/:id/devices', [
  body('uid').toInt(),
  body('vendor').trim().escape(),
  body('status').trim().escape(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const gateway = await Gateway.findById(req.params.id);
  if (gateway.devices.length >= 10) {
    res.status(400).json({ message: 'Device limit exceeded' });
    return;
  }
  gateway.devices.push(req.body);
  await gateway.save();
  res.json(gateway);
});

app.delete('/gateways/:gatewayId/devices/:deviceId', async (req, res) => {
  try {
    const gateway = await Gateway.findById(req.params.gatewayId);
    if (!gateway) {
      res.status(404).send('Gateway not found');
      return;
    }

    const device = gateway.devices.id(req.params.deviceId);
    if (!device) {
      res.status(404).json('Device not found');
      return;
    }

    gateway.devices.pull(device);
    await gateway.save();

    res.status(200).json(gateway);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.listen(3000, () => console.log('Server ready'));
