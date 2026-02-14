import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEYS } from 'src/common/constants';
import { UnAuthorizedException, ForbiddenException } from 'src/exceptions';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { PrismaService } from '../database/prisma';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: any = context.switchToHttp().getRequest();

      const requiresSubscription = this.reflector.getAllAndOverride<boolean>(
        METADATA_KEYS.REQUIRES_SUBSCRIPTION_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiresSubscription) return true;

      const user: UserEntity = request.user;
      if (!user) {
        throw new UnAuthorizedException('User not authenticated');
      }

      // Check for an active subscription to ANY product
      // In a more advanced version, we could check for a specific serviceCode if provided via decorator
      const activeSubscription = await this.prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: SubscriptionStatus.ACTIVE,
          OR: [
            { endDate: { gt: new Date() } },
            { endDate: null },
          ],
        },
      });

      if (!activeSubscription) {
        throw new ForbiddenException(
          'No active subscription found. Please subscribe to access this service.',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof UnAuthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      Logger.error(error.message, 'SubscriptionGuard');
      throw new UnAuthorizedException('Access denied');
    }
  }
}
