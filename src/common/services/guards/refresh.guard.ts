import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UnAuthorizedException } from 'src/exceptions';
import { PrismaService } from '../database/prisma';
import { JwtUtilsService } from 'src/modules/utils/jwt';
import { TokenTypeEnum } from 'src/common';
import { EncryptionUtilsService } from 'src/modules/utils';
import { JwtPayload } from 'jsonwebtoken';
import { METADATA_KEYS } from 'src/common/constants';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private readonly data: PrismaService,
    private readonly reflector: Reflector,
    private readonly jwt: JwtUtilsService,
    private readonly encryption: EncryptionUtilsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: any = context.switchToHttp().getRequest();

      const decorator = this.reflector.get(
        METADATA_KEYS.REFRESH_TOKEN_REQUIRED,
        context.getHandler(),
      );

      if (!decorator) return true;

      const token =
        request.cookies['refresh_token'] || request.body.refreshToken;

      if (!token) throw new UnAuthorizedException('Refresh token not found');

      const tokenType = decorator ? TokenTypeEnum.REFRESH : null;
      const decoded = await this.jwt.verify(token, tokenType);

      if (!decoded) {
        const notDecodedMessage = 'Invalid refresh token';
        Logger.error(notDecodedMessage, 'RefreshGuard');
        throw new UnAuthorizedException(notDecodedMessage);
      }

      const user = await this.data.user.findUnique({
        where: {
          id: (decoded as JwtPayload).id,
        },
      });

      if (!user) throw new UnAuthorizedException('Invalid refresh token');

      const { refreshToken } = user;
      const tokenMatches = await this.encryption.compareHash(
        token,
        refreshToken,
      );

      if (!tokenMatches) {
        throw new UnAuthorizedException('Invalid refresh token');
      }

      request.user = user;

      return true;
    } catch (error) {
      let message = 'Invalid refresh token';
      if (error.message) {
        if (error.message.includes('jwt expired')) {
          message = 'Refresh token expired';
        } else {
          message = error.message;
        }
      }
      Logger.error(message, 'RefreshGuard');
      throw new UnAuthorizedException(message);
    }
  }
}
