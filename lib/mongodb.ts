import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

/**
 * Global is used here to maintain a cached connection across hot-reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // SERVERLESS & PERFORMANCE OPTIMIZATIONS:
      maxPoolSize: 10, // Prevents Atlas connection exhaust in Serverless environments
      minPoolSize: 2,  // Keeps a minimum of 2 ready/hot connections
      serverSelectionTimeoutMS: 5000, // Timeout fast if DB is down (keeps app responsive)
      socketTimeoutMS: 45000, // Closes stale sockets to preserve resources
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log("Connected to MongoDB successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on error so next attempt can retry
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
