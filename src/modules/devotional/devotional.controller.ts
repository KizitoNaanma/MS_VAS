import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { DevotionalService } from './devotional.service';
import { ResponseUtilsService } from '../utils';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  ReligionMustMatch,
  SubscriptionRequired,
} from 'src/common';
import { DailyDevotionalResponseDto } from 'src/common/dto/devotional';
import { CurrentUserReligion } from 'src/common/decorators/current-user-religion.decorator';
import { Religion } from '@prisma/client';
import { CurrentUserReligionInterceptor } from 'src/common/interceptors/current-user-religion.interceptor';
import { Response } from 'express';
import { SubscriptionAccessInterceptor } from 'src/common/interceptors/subscription-access.interceptor';

@ApiBearerAuth()
@ApiTags('Devotionals')
@Controller('devotionals')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@ReligionMustMatch()
@SubscriptionRequired()
@AuthorizationRequired()
@UseInterceptors(CurrentUserReligionInterceptor)
@UseInterceptors(SubscriptionAccessInterceptor)
export class DevotionalController {
  constructor(
    private readonly devotionalService: DevotionalService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's devotional" })
  @ApiOkResponse({
    description: 'Devotional fetched successfully',
    type: DailyDevotionalResponseDto,
  })
  async getTodaysDevotional(
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.devotionalService.getTodaysDevotional(religion);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('previous')
  @ApiOperation({ summary: 'Get previous days devotionals' })
  @ApiOkResponse({
    description: 'Devotionals fetched successfully',
    type: [DailyDevotionalResponseDto],
  })
  @ApiQuery({ name: 'days', type: Number, required: true })
  async getPreviousDaysDevotionals(
    @Query('days') days: number,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.devotionalService.getPreviousDaysDevotionals(days, religion);
    return this.response.sendResponse(res, serviceResponse);
  }
}
