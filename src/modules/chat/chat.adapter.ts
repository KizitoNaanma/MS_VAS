import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import { JwtUtilsService } from '../utils';
import { PrismaService } from 'src/common/services/database/prisma';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { UnAuthorizedWebsocketException } from 'src/exceptions';
import { JwtPayload } from 'jsonwebtoken';
import {
  TokenTypeEnum,
} from 'src/common';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import redisConfig from 'src/shared/cache/redis/redis-config';

export class WebsocketAdapter extends IoAdapter {
  private readonly jwtService: JwtUtilsService;
  private readonly prismaService: PrismaService;
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private logger: Logger;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.jwtService = this.app.get(JwtUtilsService);
    this.prismaService = this.app.get(PrismaService);
    this.logger = new Logger(WebsocketAdapter.name);
  }

  private consoleLogRedisConnectionError = (err: any) => {
    this.logger.error(
      `Chat Adapter Redis connection error occurred: ${err.message}`,
    );

    // Check for READONLY error which indicates replica sync issues
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      this.logger.warn(
        'Chat Adapter Redis READONLY error detected - attempting reconnection',
      );
      return true;
    }
    return false;
  };

  async connectToRedis(): Promise<void> {
    const pubClient = createClient(redisConfig);
    const subClient = pubClient.duplicate();

    await Promise.all([
      pubClient.connect().catch(this.consoleLogRedisConnectionError),
      subClient.connect().catch(this.consoleLogRedisConnectionError),
    ]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any) {
    const server: Server = super.createIOServer(port, options);
    // Apply Redis adapter if available
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    server.use(async (socket, next) => {
      try {
        let token =
          socket.handshake.headers.authorization ||
          socket.handshake.auth?.token;

        if (!token) {
          return next(
            new UnAuthorizedWebsocketException('Unauthorized access'),
          );
        }
        token = token.replace('Bearer ', '');

        const decoded = await this.jwtService.verify(
          token,
          TokenTypeEnum.ACCESS,
        );

        if (!decoded) {
          return next(
            new UnAuthorizedWebsocketException('Unauthorized access'),
          );
        }

        const user = await this.prismaService.user.findUnique({
          where: {
            id: (decoded as JwtPayload).id,
          },
        });

        if (!user) {
          return next(
            new UnAuthorizedWebsocketException('Unauthorized access'),
          );
        }

        socket.data.user = user; // save user info to a user object

        next();
      } catch (error) {
        this.logger.error(error);
        next(new UnAuthorizedWebsocketException('Unauthorized access'));
      }
    });
    return server;
  }
}
