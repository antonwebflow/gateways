import mongoose from 'mongoose';
import Gateway from './models/Gateway.js';
import connectDB from './db.js';

const seedDB = async () => {
  await connectDB();

  await Gateway.deleteMany({});

  const gateways = [
    {
      serial: 'serial1',
      name: 'Gateway 1',
      address: '192.168.1.1',
      devices: [
        {
          uid: 1,
          vendor: 'Vendor 1',
          status: 'online',
        },
        {
          uid: 2,
          vendor: 'Vendor 2',
          status: 'offline',
        },
      ],
    },
    {
      serial: 'serial2',
      name: 'Gateway 2',
      address: '192.168.1.2',
      devices: [
        {
          uid: 3,
          vendor: 'Vendor 3',
          status: 'online',
        },
      ],
    },
  ];

  const saveGateway = async (gatewayData) => {
    const gateway = new Gateway(gatewayData);
    try {
      await gateway.save();
    } catch (err) {
      console.log('Error seeding data: ', err);
    }
  };

  const promises = gateways.map((gatewayData) => saveGateway(gatewayData));

  try {
    await Promise.all(promises);
  } catch (err) {
    console.log('Error during seeding: ', err);
  }

  console.log('Database seeded!');
  mongoose.connection.close();
};

seedDB().catch((error) => console.log('Seed failed:', error));
