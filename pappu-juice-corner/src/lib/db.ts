import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, server: null };
}

async function connectToDatabase() {
  // Always register models first — runs on every call, warm or cold
  if (!(global as any).modelsRegistered) {
    await Promise.all([
      import('@/models/User'),
      import('@/models/Product'),
      import('@/models/Order'),
      import('@/models/Cart'),
      import('@/models/Settings'),
    ]);
    (global as any).modelsRegistered = true;
  }

  // Then handle connection caching
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const originalUri = process.env.MONGODB_URI;

    if (process.env.NODE_ENV === 'production') {
      const requiredEnvVars = ['MONGODB_URI', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
      const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
      if (missingVars.length > 0) {
        console.error('❌ CRITICAL: Missing production environment variables:', missingVars.join(', '));
      }
    }

    if (!originalUri || originalUri.includes('127.0.0.1') || originalUri.includes('localhost')) {
      cached.promise = (async () => {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        if (!cached.server) cached.server = await MongoMemoryServer.create();
        const uri = cached.server.getUri();
        return mongoose.connect(uri, { bufferCommands: false });
      })();
    } else {
      cached.promise = mongoose.connect(originalUri, { bufferCommands: false });
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
