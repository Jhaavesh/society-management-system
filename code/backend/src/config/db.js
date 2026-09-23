import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  
  // Use memory server only for testing
  if (isTest || (!uri || uri.includes('localhost') || uri.includes('127.0.0.1'))) {
    const mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), getConnectionOptions());
    console.log('MongoDB connected (memory server)');
    return;
  }

  // Production/Development Atlas connection with pooling
  await mongoose.connect(uri, getConnectionOptions());
  console.log('MongoDB connected (Atlas)');
}

function getConnectionOptions() {
  return {
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 100,
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE) || 10,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    retryReads: true,
  };
}

export function getConnectionStats() {
  const conn = mongoose.connection;
  return {
    readyState: conn.readyState,
    host: conn.host,
    port: conn.port,
    name: conn.name,
    models: Object.keys(conn.models).length,
  };
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
