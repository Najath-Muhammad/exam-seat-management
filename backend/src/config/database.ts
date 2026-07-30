import mongoose from 'mongoose';
import { env } from './environment';

/**
 * Establishes the Mongoose connection to MongoDB.
 *
 * - Uses the URI from the typed environment config (never hardcoded).
 * - Logs a clear success message on connect.
 * - Logs an error and exits the process on failure, so the Express
 *   server never starts with a dead database connection.
 *
 * No schemas, models, or business logic live here.
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('[Database] MongoDB connected successfully.');
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    // Exit so the server does not start without a working DB connection.
    process.exit(1);
  }
};

// ─── Connection lifecycle events ──────────────────────────────────────────────

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected.');
});

mongoose.connection.on('error', (err: Error) => {
  console.error('[Database] MongoDB runtime error:', err.message);
});
