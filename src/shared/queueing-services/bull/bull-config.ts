import {
  REDIS_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_TLS,
  REDIS_USERNAME,
  REDIS_URL,
} from 'src/common';
import { RedisOptions } from 'ioredis';

const redisConfig: string | RedisOptions = REDIS_URL
  ? REDIS_URL
  : {
      username: String(REDIS_USERNAME),
      password: String(REDIS_PASSWORD),
      host: String(REDIS_HOST),
      port: Number(REDIS_PORT),
      tls:
        REDIS_TLS === 'true'
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
    };

const defaultJobOptions = {
  attempts: 3,
  removeOnComplete: true,
  removeOnFail: false,
  backoff: {
    type: 'exponential',
    delay: 10000,
  },
};

const settings = {
  stalledInterval: 30000,
  maxStalledCount: 3,
  drainDelay: 5,
};

const bullRedisConfig = {
  redis: redisConfig,
  defaultJobOptions,
  settings,
};

export default bullRedisConfig;
