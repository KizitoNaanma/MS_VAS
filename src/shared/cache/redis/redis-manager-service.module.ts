import { redisStore } from 'cache-manager-redis-yet';
import { Logger, Module } from '@nestjs/common';
import config from './redis-config';
import { RedisService } from './redis.service';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import type { RedisClientOptions } from 'redis';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';

const consoleLogRedisConnectionError = (err: any) => {
  Logger.error(
    `Redis connection error occurred: ${err.message}`,
    'Redis Manager Service',
  );

  // Check for READONLY error which indicates replica sync issues
  const targetError = 'READONLY';
  if (err.message.includes(targetError)) {
    Logger.warn(
      'Redis READONLY error detected - attempting reconnection',
      'Redis Manager Service',
    );
    return true;
  }
  return false;
};

// Create shared Redis client
export const redisClient = createClient({
  ...config,
});

redisClient.connect().catch(consoleLogRedisConnectionError);

export const adminjsRedisStore = new RedisStore({
  client: redisClient,
  prefix: 'adminjs:',
});

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      useFactory: async () => {
        const store = await redisStore({
          ...config,
        });

        return {
          store: store as unknown as CacheStore,
          ttl: 3 * 60000, // 3 minutes (milliseconds)
        };
      },
    }),
  ],
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      useValue: redisClient,
    },
    {
      provide: 'ADMINJS_REDIS_STORE',
      useValue: adminjsRedisStore,
    },
  ],
  exports: [RedisService, 'REDIS_CLIENT', 'ADMINJS_REDIS_STORE'],
})
export class RedisServiceModule {}
