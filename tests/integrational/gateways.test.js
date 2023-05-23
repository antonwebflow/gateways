import request from 'supertest';
import { Types } from 'mongoose';

const LOCALHOST = 'http://localhost:3000';

const requestLocalhost = request(LOCALHOST);

describe('gateways', () => {
  it('should get all gateways and specific gateway', async () => {
    const res = await requestLocalhost
      .get('/gateways')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const gatewayId = res.body[0]._id;
    const res2 = await requestLocalhost.get(`/gateways/${gatewayId}`).expect(200);
    expect(res2.body._id).toBe(gatewayId);
  });

  it('should create a new gateway', async () => {
    const serial = new Types.ObjectId();

    const newGateway = {
      serial,
      name: 'Gateway 14',
      address: '192.168.1.3',
      devices: [
        {
          uid: 50,
          vendor: 'Vendor 5',
          status: 'online',
        },
      ],
    };
    const res = await requestLocalhost
      .post('/gateways')
      .send(newGateway)
      .expect('Content-Type', /json/)
      .expect(201);
    expect(res.body.name).toBe(newGateway.name);
  });

  it('should throw error when invalid IPv4 address is provided', async () => {
    const newGateway = {
      serial: 'serial7',
      name: 'Gateway 4',
      address: '300.168.1.300', // Invalid IPv4 address
      devices: [
        {
          uid: 7,
          vendor: 'Vendor 7',
          status: 'online',
        },
      ],
    };
    const res = await requestLocalhost
      .post('/gateways')
      .send(newGateway)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body).toHaveProperty('errors');
  });

  it('should add a device to a gateway', async () => {
    const res = await requestLocalhost
      .get('/gateways')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const gatewayId = res.body[0]._id;
    const newDevice = {
      uid: 6,
      vendor: 'Vendor 6',
      status: 'offline',
    };
    const res2 = await requestLocalhost
      .post(`/gateways/${gatewayId}/devices`)
      .send(newDevice)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res2.body.devices).toContainEqual(expect.objectContaining(newDevice));
  });

  it('should remove a device from a gateway', async () => {
    const res = await requestLocalhost
      .get('/gateways')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const gatewayId = res.body[0]._id;
    const deviceId = res.body[0].devices[0]._id;
    expect(deviceId).toBeDefined();
    const res2 = await requestLocalhost
      .delete(`/gateways/${gatewayId}/devices/${deviceId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res2.body.devices).not.toContainEqual(expect.objectContaining({ uid: deviceId }));
  });
});
