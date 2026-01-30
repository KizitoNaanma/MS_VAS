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
import { UserRole } from '@prisma/client';

@Injectable()
export class RequiresAdminRole implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: any = context.switchToHttp().getRequest();

      const requiresAdminRole = this.reflector.getAllAndOverride(
        METADATA_KEYS.REQUIRES_ADMIN_ROLE,
        [context.getHandler(), context.getClass()],
      );

      if (!requiresAdminRole) return true;

      // Assuming the user is already authenticated
      const user: UserEntity = request.user;

      if (!user) {
        throw new UnAuthorizedException(
          'Session has expired, please login or restart reset password process.',
        );
      }

      // Check if user already has admin roles
      if (
        user.roles.includes(UserRole.SUPERADMIN) ||
        user.roles.includes(UserRole.ADMIN)
      ) {
        return true;
      }

      // If we reach here, user is not an admin
      throw new UnAuthorizedException('User is not an admin.');
    } catch (error) {
      Logger.error(
        `Admin role check failed: ${error.message}`,
        'RequiresAdminRole',
      );

      // Only use generic message if error is not UnAuthorizedException
      if (error instanceof UnAuthorizedException) {
        throw error;
      }

      throw new UnAuthorizedException(
        'An error occurred while checking admin permissions.',
      );
    }
  }
}
