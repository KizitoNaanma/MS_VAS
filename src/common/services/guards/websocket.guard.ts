import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma';
import { JwtUtilsService } from 'src/modules/utils';
import { UnAuthorizedWebsocketException } from 'src/exceptions';
import { TokenTypeEnum } from 'src/common/enum';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class WebsocketGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwt: JwtUtilsService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const socket = context.switchToWs().getClient();
      let token = socket.handshake.headers.authorization;

      if (!token) {
        throw new UnAuthorizedWebsocketException('Unauthorized');
      }
      token = token.replace('Bearer ', '');

      const decoded = await this.jwt.verify(token, TokenTypeEnum.ACCESS);

      if (!decoded) {
        throw new UnAuthorizedWebsocketException('Unauthorized');
      }

      const user = await this.prismaService.user.findUnique({
        where: {
          id: (decoded as JwtPayload).id,
        },
      });

      if (!user) {
        throw new UnAuthorizedWebsocketException('Unauthorized');
      }

      socket.data.user = user; // save user info to a user object

      return true;
    } catch (error) {
      throw new UnAuthorizedWebsocketException('Unauthorized');
    }
  }
}
