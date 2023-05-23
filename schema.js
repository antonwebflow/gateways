import { Schema } from 'mongoose';

export const deviceSchema = new Schema({
  uid: { type: Number, required: true },
  vendor: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline'], required: true },
  created: { type: Date, default: Date.now },
});

function arrayLimit(val) {
  return val.length <= 10;
}

export const gatewaySchema = new Schema({
  serial: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: {
    type: String,
    validate: {
      validator(v) {
        // validate ipv4 format
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v);
      },
      message: (props) => `${props.value} is not a valid IPv4 address!`,
    },
    required: [true, 'IP address required'],
  },
  devices: { type: [deviceSchema], validate: [arrayLimit, '{PATH} exceeds the limit of 10'] },
});
