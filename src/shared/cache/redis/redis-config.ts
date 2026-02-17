import { Logger } from '@nestjs/common';
import {
  REDIS_USERNAME,
  REDIS_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_TLS,
} from 'src/common';

const socketOptions = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  tls: String(REDIS_TLS) === 'true',
  rejectUnauthorized: false,
  reconnectStrategy(retries: number, cause: Error) {
    if (cause) {
      Logger.error(
        `Redis reconnection error: ${cause.message}`,
        'Redis Service Client',
      );
    }
    if (retries > 3) {
      return new Error('Failed to connect to Redis');
    }
    return Math.min(retries * 50, 2000);
  },
};

const redisConfig: any = {
  username: String(REDIS_USERNAME),
  password: String(REDIS_PASSWORD),
  pingInterval: 120000,
  socket: socketOptions,
};

export default redisConfig;
