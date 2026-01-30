import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../database/prisma';
import { JwtUtilsService } from 'src/modules/utils/jwt';
import { TokenTypeEnum } from 'src/common';
import { UnAuthorizedException } from 'src/exceptions';
import { JwtPayload } from 'jsonwebtoken';
import { METADATA_KEYS } from 'src/common/constants';
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reflector: Reflector,
    private readonly jwt: JwtUtilsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: any = context.switchToHttp().getRequest();

      const authRequired = this.reflector.getAllAndOverride(
        METADATA_KEYS.ACCESS_TOKEN_REQUIRED,
        [context.getHandler(), context.getClass()],
      );

      if (!authRequired) return true;

      let token = request.headers.authorization;

      if (!token) {
        throw new UnAuthorizedException(
          'Session has expired, please login or restart reset password process.',
        );
      }

      token = token.replace('Bearer ', '');

      const tokenType = authRequired ? TokenTypeEnum.ACCESS : null;
      const decoded = await this.jwt.verify(token, tokenType);

      if (!decoded) {
        throw new UnAuthorizedException(
          'Session has expired, please login or restart reset password process.',
        );
      }

      const user = await this.prismaService.user.findUnique({
        where: {
          id: (decoded as JwtPayload).id,
        },
      });

      if (!user) {
        throw new UnAuthorizedException(
          'Session has expired, please login or restart reset password process.',
        );
      }

      if (!user.isActive) {
        throw new UnAuthorizedException(
          'Your account has been deactivated, please contact support.',
        );
      }

      request.user = user;

      return true;
    } catch (error) {
      Logger.error(error.message, 'AuthenticationGuard');
      throw new UnAuthorizedException(
        `Session has expired, please login or restart reset password process.`,
      );
    }
  }
}
