import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEYS } from 'src/common/constants';
import { UnAuthorizedException } from 'src/exceptions';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';

export const PLATFORM_RELIGION_HEADER = 'x-platform-religion';

@Injectable()
export class ReligionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: any = context.switchToHttp().getRequest();

      const religionMustMatch = this.reflector.getAllAndOverride(
        METADATA_KEYS.RELIGION_MUST_MATCH_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!religionMustMatch) return true;

      // Assuming the user is already authenticated
      const user: UserEntity = request.user;
      const platformReligion =
        request.headers[PLATFORM_RELIGION_HEADER].toLowerCase();

      if (!platformReligion) {
        throw new UnAuthorizedException('Platform religion is required.');
      }

      if (!user) {
        throw new UnAuthorizedException(
          'Session has expired, please login or restart reset password process.',
        );
      }

      if (user.religion !== platformReligion) {
        throw new UnAuthorizedException(
          'User religion does not match platform religion.',
        );
      }

      return true;
    } catch (error) {
      Logger.error(error.message, 'ReligionGuard');
      const message =
        error.message ||
        'Session has expired, please login or restart reset password process.';
      throw new UnAuthorizedException(message);
    }
  }
}
