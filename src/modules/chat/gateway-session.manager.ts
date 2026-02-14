import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import {
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_TLS,
  REDIS_USERNAME,
  REDIS_URL,
} from 'src/common';
import { AuthenticatedUserSocket } from 'src/common/interfaces';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { TimeUtilsService } from '../utils';

export interface IGatewaySessionManager {
  getUserSocket(id: string): Promise<AuthenticatedUserSocket | null>;
  setUserSocket(id: string, socket: AuthenticatedUserSocket): Promise<void>;
  removeUserSocket(id: string): Promise<void>;
  getSockets(): Promise<Map<string, AuthenticatedUserSocket>>;
}

interface SocketInfo {
  id: string;
  user: UserEntity;
}

@Injectable()
export class GatewaySessionManager implements IGatewaySessionManager {
  private redisClient: RedisClientType;
  private readonly logger = new Logger(GatewaySessionManager.name);
  private readonly SOCKET_PREFIX = 'socket:';

  constructor(private readonly timeUtils: TimeUtilsService) {
    this.initializeRedisConnection();
    this.logger.log('Gateway Session Manager Initialized');
  }

  private consoleLogRedisConnectionError = (err: any) => {
    this.logger.error(
      `Gateway Session Manager Client Redis connection error occurred: ${err.message}`,
    );

    // Check for READONLY error which indicates replica sync issues
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      this.logger.warn(
        'Gateway Session Manager Client Redis READONLY error detected - attempting reconnection',
      );
      return true;
    }
    return false;
  };

  private async initializeRedisConnection() {
    this.redisClient = createClient({
      ...(REDIS_URL
        ? { url: REDIS_URL }
        : {
            username: String(REDIS_USERNAME),
            password: String(REDIS_PASSWORD),
            socket: {
              host: String(REDIS_HOST),
              port: Number(REDIS_PORT),
              tls: REDIS_TLS === 'true',
              rejectUnauthorized: false,
            },
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
        reconnectStrategy: (retries, cause) => {
          if (cause) {
            this.logger.error(`Redis reconnection error: ${cause}`);
          }
          if (retries > 3) {
            return new Error('Failed to connect to Redis');
          }
          return Math.min(retries * 50, 2000);
        },
      },
      pingInterval: 120000,
    });

    this.redisClient.on('error', (err) =>
      this.logger.error('Gateway Session Manager Client Error:', err),
    );

    await this.redisClient.connect().catch(this.consoleLogRedisConnectionError);
  }

  async getUserSocket(userId: string): Promise<AuthenticatedUserSocket | null> {
    const socketData = await this.redisClient.get(
      `${this.SOCKET_PREFIX}${userId}`,
    );
    return socketData ? JSON.parse(socketData) : null;
  }

  async setUserSocket(
    userId: string,
    socket: AuthenticatedUserSocket,
  ): Promise<void> {
    const socketInfo: SocketInfo = {
      id: socket.id,
      user: socket.data.user,
    };
    const tenMinutesInMilliSeconds = this.timeUtils.convertToMilliseconds(
      'minutes',
      10,
    );
    await this.redisClient.set(
      `${this.SOCKET_PREFIX}${userId}`,
      JSON.stringify(socketInfo),
      {
        EX: tenMinutesInMilliSeconds,
      },
    );
  }

  async removeUserSocket(userId: string): Promise<void> {
    await this.redisClient.del(`${this.SOCKET_PREFIX}${userId}`);
  }

  async getSockets(): Promise<Map<string, AuthenticatedUserSocket>> {
    const keys = await this.redisClient.keys(`${this.SOCKET_PREFIX}*`);
    const sockets = new Map();

    for (const key of keys) {
      const userId = key.replace(this.SOCKET_PREFIX, '');
      const socket = await this.getUserSocket(userId);
      if (socket) {
        sockets.set(userId, socket);
      }
    }

    return sockets;
  }
}
