/**
 * server.ts — Application entry point.
 *
 * Startup sequence:
 *   1. environment.ts is evaluated → dotenv.config() runs, env vars are validated.
 *   2. connectDatabase() → Mongoose connects to MongoDB.
 *   3. Only on successful DB connection → Express starts listening.
 *   4. On DB failure → process exits (no HTTP server is started).
 */

// Import environment FIRST so dotenv.config() fires before anything
// else reads process.env.
import { env } from './config/environment';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initializeSocket } from './socket';
import app from './app';

const startServer = async (): Promise<void> => {
  // Step 1: Connect to MongoDB.
  // connectDatabase() will call process.exit(1) on failure,
  // so the lines below only execute when the connection succeeds.
  await connectDatabase();
  
  // Connect to Redis
  await connectRedis();

  // Step 2: Start the HTTP server.
  const server = app.listen(env.PORT, () => {
    console.log(
      `[Server] Running on port ${env.PORT} in ${env.NODE_ENV} mode.`
    );
  });

  // Step 3: Start Socket.IO
  initializeSocket(server);
};

startServer();
