import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // uri should be in .env file
    await mongoose.connect('mongodb://127.0.0.1/gateway', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
