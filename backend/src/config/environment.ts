import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[Config] Missing required environment variable: "${key}". Check your .env file.`
    );
  }
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  MONGO_URI: requireEnv('MONGO_URI'),
  REDIS_URL: requireEnv('REDIS_URL'),
  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
} as const;

export type Env = typeof env;
