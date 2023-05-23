import mongoose from 'mongoose';
import { gatewaySchema } from '../schema.js';

const Gateway = mongoose.model('Gateway', gatewaySchema);

export default Gateway;
