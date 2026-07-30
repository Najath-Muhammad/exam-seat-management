import { createClient } from 'redis';
import { env } from './environment';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err) => {
  logger.error('[Redis] Error:', err);
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('[Redis] Connected successfully.');
  } catch (error) {
    logger.error('[Redis] Connection failed:', error);
    process.exit(1);
  }
};
