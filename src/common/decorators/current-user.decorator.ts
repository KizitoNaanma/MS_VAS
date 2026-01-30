import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);

export const GetCurrentUser = createParamDecorator(
  (field: keyof UserEntity, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user[field];
  },
);
