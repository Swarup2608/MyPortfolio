import mongoose from 'mongoose';
import env from './env.js';

export async function connectDB() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is not set in backend/.env');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri);
  const { host, name } = mongoose.connection;
  console.log(`[db] Connected to MongoDB — host=${host} db=${name}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
