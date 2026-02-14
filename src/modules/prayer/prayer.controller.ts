import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { PrayerService } from './prayer.service';
import { ResponseUtilsService } from '../utils';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserReligion } from 'src/common/decorators/current-user-religion.decorator';
import { Religion } from '@prisma/client';
import { DailyPrayerResponseDto } from 'src/common/dto/prayer';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  SubscriptionRequired,
} from 'src/common';
import { CurrentUserReligionInterceptor } from 'src/common/interceptors/current-user-religion.interceptor';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Prayers')
@Controller('prayers')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@SubscriptionRequired()
@AuthorizationRequired()
@UseInterceptors(CurrentUserReligionInterceptor)
export class PrayerController {
  constructor(
    private readonly prayerService: PrayerService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's prayer" })
  @ApiOkResponse({
    description: 'Prayer fetched successfully',
    type: DailyPrayerResponseDto,
  })
  async getTodaysPrayer(
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.prayerService.getTodaysPrayer(religion);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('previous')
  @ApiOperation({ summary: 'Get previous days prayers' })
  @ApiOkResponse({
    description: 'Prayers fetched successfully',
    type: [DailyPrayerResponseDto],
  })
  @ApiQuery({ name: 'days', type: Number, required: true })
  async getPreviousDaysPrayers(
    @Query('days') days: number,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.prayerService.getPreviousDaysPrayers(
      days,
      religion,
    );
    return this.response.sendResponse(res, serviceResponse);
  }
}
