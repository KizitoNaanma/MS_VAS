import { Logger } from '@nestjs/common';
import {
  REDIS_USERNAME,
  REDIS_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_TLS,
  REDIS_URL,
} from 'src/common';
import {
  RedisClientOptions,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from 'redis';

const redisConfig: RedisClientOptions<
  RedisModules,
  RedisFunctions,
  RedisScripts
> = {
  ...(REDIS_URL ? { url: REDIS_URL } : {
    username: String(REDIS_USERNAME),
    password: String(REDIS_PASSWORD),
    socket: {
      host: String(REDIS_HOST),
      port: Number(REDIS_PORT),
      tls: REDIS_TLS === 'true',
      rejectUnauthorized: false,
    }
  }),
  socket: {
    ...(REDIS_URL
      ? {}
      : {
          host: String(REDIS_HOST),
          port: Number(REDIS_PORT),
        }),
    tls: String(REDIS_TLS) === 'true',
    rejectUnauthorized: false,
    reconnectStrategy(retries, cause) {
      if (cause) {
        Logger.error(
          `Redis reconnection error: ${cause}`,
          'Redis Service Client',
        );
      }
      if (retries > 3) {
        return new Error('Failed to connect to Redis');
      }
      return Math.min(retries * 50, 2000);
    },
  },
  pingInterval: 120000,
};

export default redisConfig;
