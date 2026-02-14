import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../services/database/prisma';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { DoesNotExistsException, UnAuthorizedException } from 'src/exceptions';

import { IcellProductsService } from 'src/shared/icell-core/services/icell-products.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class CurrentUserReligionInterceptor implements NestInterceptor {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly icellProductsService: IcellProductsService,
  ) {}
  async intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    if (!user)
      throw new UnAuthorizedException(
        'Session has expired, please login or restart reset password process.',
      );

    const activeSubscriptions = await this.prismaService.subscription.findMany({
      where: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
        OR: [{ endDate: { gt: new Date() } }, { endDate: null }],
      },
      orderBy: { createdAt: 'desc' },
    });

    let religionCode: string | null = null;

    for (const sub of activeSubscriptions) {
      const service = this.icellProductsService.getServiceByProductId(
        sub.productId,
      );
      if (service && service.religion) {
        religionCode = service.religion;
        break;
      }
    }

    if (!religionCode && user.religion) {
      religionCode = user.religion;
    }

    if (!religionCode) {
      throw new DoesNotExistsException(
        'User has no active religious subscription or preference',
      );
    }

    const religion = await this.prismaService.religion.findFirst({
      where: { code: religionCode },
    });

    request.religion = religion;
    return handler.handle();
  }
}
