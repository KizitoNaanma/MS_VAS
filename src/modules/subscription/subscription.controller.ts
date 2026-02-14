import {
  Controller,
  Get,
  HttpStatus,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  CurrentUser,
  SubscriptionRequired,
} from 'src/common';
import { ResponseUtilsService } from '../utils';
import { Response } from 'express';
import { CurrentUserReligion } from 'src/common/decorators/current-user-religion.decorator';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { StoreAndWalletResponseDto } from 'src/common/dto/subscription';
import { CurrentUserReligionInterceptor } from 'src/common/interceptors/current-user-religion.interceptor';
import { Religion } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('Subscription')
@Controller('subscription')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@SubscriptionRequired()
@AuthorizationRequired()
@UseInterceptors(CurrentUserReligionInterceptor)
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('store')
  @ApiOperation({ summary: 'Get products for subscription in store' })
  @ApiResponse({
    status: 200,
    description: 'Products for subscription in store retrieved successfully',
    type: StoreAndWalletResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Bad Request')
  async getStore(
    @CurrentUser() user: UserEntity,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const response = await this.subscriptionService.getStore(religion, user);
    return this.response.sendResponse(res, response);
  }
}
