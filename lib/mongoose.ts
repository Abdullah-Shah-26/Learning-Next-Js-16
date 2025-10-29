import mongoose, { Connection, ConnectOptions } from 'mongoose';

/**
 * Global type declaration for mongoose connection caching
 * This prevents multiple connections in development due to hot reloading
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

/**
 * MongoDB connection URI from environment variables
 * @throws {Error} If MONGODB_URI is not defined in environment variables
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env file'
  );
}

/**
 * MongoDB connection options for optimization and security
 */
const options: ConnectOptions = {
  bufferCommands: false, // Disable mongoose buffering
  maxPoolSize: 10, // Maximum number of connections in the connection pool
  serverSelectionTimeoutMS: 5000, // Timeout for selecting a server
  socketTimeoutMS: 45000, // Timeout for socket inactivity
};

/**
 * Cached connection object to reuse across hot reloads in development
 * In production, this ensures we don't create multiple connections
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes connection to MongoDB database
 * Uses singleton pattern to prevent multiple connections in Next.js
 * 
 * @returns {Promise<Connection>} MongoDB connection instance
 * @throws {Error} If connection to MongoDB fails
 * 
 * @example
 * import connectDB from '@/lib/mongoose';
 * 
 * export async function GET() {
 *   await connectDB();
 *   // Your database operations here
 * }
 */
async function connectDB(): Promise<Connection> {
  /**
   * Return existing connection if already established
   * This prevents unnecessary reconnection attempts
   */
  if (cached.conn) {
    return cached.conn;
  }

  /**
   * If connection promise doesn't exist, create a new one
   * This ensures only one connection attempt happens at a time
   */
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, options)
      .then((mongooseInstance) => {
        console.log('MongoDB connected successfully');
        return mongooseInstance.connection;
      })
      .catch((error: Error) => {
        console.error('MongoDB connection error:', error);
        // Reset promise on failure so retry is possible
        cached.promise = null;
        throw error;
      });
  }

  /**
   * Wait for the connection promise to resolve
   * Store the connection in cache for future use
   */
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Gracefully closes the MongoDB connection
 * Useful for cleanup in serverless environments or testing
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * import { disconnectDB } from '@/lib/mongoose';
 * await disconnectDB();
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('MongoDB disconnected');
  }
}

/**
 * Checks if database is currently connected
 * 
 * @returns {boolean} True if connected, false otherwise
 */
export function isConnected(): boolean {
  return cached.conn !== null && mongoose.connection.readyState === 1;
}

export default connectDB;
