import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    let uri = config.mongoUri;

    if (uri && uri.trim() !== '') {
      try {
        console.log(`📡 Attempting connection to MongoDB at: ${uri}`);
        await mongoose.connect(uri);
        console.log('✅ Connected to external MongoDB successfully.');
        return;
      } catch (err) {
        console.warn('⚠️ Failed to connect to configured MONGODB_URI. Falling back to in-memory MongoDB...');
      }
    }

    console.log('🚀 Initializing MongoMemoryServer (In-Memory MongoDB)...');
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`✅ Connected to in-memory MongoDB at: ${uri}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
