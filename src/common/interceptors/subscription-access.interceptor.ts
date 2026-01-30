import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../services/database/prisma';
import { SubscriptionStatus, UserRole } from '@prisma/client';
import { SubscriptionEntity } from 'src/shared/database/prisma/generated/subscription.entity';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { METADATA_KEYS } from '../constants';

@Injectable()
export class SubscriptionAccessInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  private async getActiveSubscription(userId: string) {
    return await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        OR: [
          { endDate: { gt: new Date() } },
          { endDate: null }, // ondemand subscriptions
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async checkAccess(
    subscription: SubscriptionEntity,
  ): Promise<boolean> {
    if (!subscription) return false;
    return subscription.accessCount < subscription.maxAccess;
  }

  private async incrementAccessCount(subscriptionId: string) {
    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        accessCount: { increment: 1 },
      },
    });

    // Check if we've reached max access after increment
    if (updatedSubscription.accessCount >= updatedSubscription.maxAccess) {
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: SubscriptionStatus.EXHAUSTED },
      });
    }
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const requiresSubscription = this.reflector.getAllAndOverride<boolean>(
      METADATA_KEYS.REQUIRES_SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresSubscription) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (
      user.roles.includes(UserRole.SUPERADMIN) ||
      user.roles.includes(UserRole.ADMIN)
    ) {
      return next.handle();
    }

    const subscription = await this.getActiveSubscription(user.id);
    const hasAccess = await this.checkAccess(subscription);

    if (!hasAccess) {
      throw new ForbiddenException(
        subscription
          ? 'Maximum content access limit reached. Please renew your subscription to continue.'
          : 'No active subscription found. Please subscribe to access content.',
      );
    }

    return next.handle().pipe(
      tap(async () => {
        // Only increment access count after successful response
        await this.incrementAccessCount(subscription.id);
      }),
      catchError((error) => {
        // Don't increment access count if there was an error
        return throwError(() => error);
      }),
    );
  }
}
