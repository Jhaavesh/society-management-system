import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export async function connectDatabase() {
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('localhost') && !process.env.MONGODB_URI.includes('<cluster>')) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected (Atlas)');
    return;
  }
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  console.log('MongoDB connected (memory server)');
}
