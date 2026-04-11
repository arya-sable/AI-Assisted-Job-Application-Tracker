import mongoose from 'mongoose';

let isConnecting = false;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  // Prevent duplicate in-flight connects when the server hot-reloads in dev mode.
  if (isConnecting) return;
  if (mongoose.connection.readyState === 1) return;

  isConnecting = true;

  try {
    await mongoose.connect(uri, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', (err as Error).message);
    throw err;
  } finally {
    isConnecting = false;
  }
};
