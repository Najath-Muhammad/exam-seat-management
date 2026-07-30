

import { env } from './config/environment';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initializeSocket } from './socket';
import app from './app';

const startServer = async (): Promise<void> => {
  
  
  
  await connectDatabase();
  
  
  await connectRedis();

  
  const server = app.listen(env.PORT, () => {
    console.log(
      `[Server] Running on port ${env.PORT} in ${env.NODE_ENV} mode.`
    );
  });

  
  initializeSocket(server);
};

startServer();
