import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, server: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const originalUri = process.env.MONGODB_URI;

    // Production environment variable validation
    if (process.env.NODE_ENV === "production") {
      const requiredEnvVars = ["MONGODB_URI", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
      const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
      if (missingVars.length > 0) {
        console.error("❌ CRITICAL: Missing production environment variables:", missingVars.join(", "));
      }

      if (process.env.NEXTAUTH_URL?.endsWith("/")) {
        console.error("⚠️ WARNING: NEXTAUTH_URL has a trailing slash. This can cause authentication issues on Vercel. Recommended: https://juice-store-website.vercel.app");
      }
    }

    // Use memory server if no real URI is provided or if using the dummy URI
    if (!originalUri || originalUri.includes("127.0.0.1") || originalUri.includes("localhost")) {
      console.log("🚀 Initializing In-Memory MongoDB Server for seamless local testing...");
      
      cached.promise = (async () => {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        if (!cached.server) {
          cached.server = await MongoMemoryServer.create();
        }
        const uri = cached.server.getUri();
        console.log(`\n✅ Connected to In-Memory Database seamlessly!\n`);
        return mongoose.connect(uri, opts);
      })();
    } else {
      cached.promise = mongoose.connect(originalUri, opts).then((mongoose) => mongoose);
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
