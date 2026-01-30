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

@Injectable()
export class CurrentUserReligionInterceptor implements NestInterceptor {
  constructor(private readonly prismaService: PrismaService) {}
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

    if (!user.religion)
      throw new DoesNotExistsException('User has not set religion');

    const religion = await this.prismaService.religion.findFirst({
      where: { code: user.religion },
    });
    request.religion = religion;
    return handler.handle();
  }
}
