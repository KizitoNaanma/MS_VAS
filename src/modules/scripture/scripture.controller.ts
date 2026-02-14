import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
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
  SubscriptionRequired,
} from 'src/common';
import { CurrentUserReligionInterceptor } from 'src/common/interceptors/current-user-religion.interceptor';
import { ScriptureService } from './scripture.service';
import { ResponseUtilsService } from '../utils';
import { CurrentUserReligion } from 'src/common/decorators/current-user-religion.decorator';
import { Religion } from '@prisma/client';
import { DailyScriptureResponseDto } from 'src/common/dto/scripture';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Scriptures')
@Controller('scriptures')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@SubscriptionRequired()
@AuthorizationRequired()
@UseInterceptors(CurrentUserReligionInterceptor)
export class ScriptureController {
  constructor(
    private readonly scriptureService: ScriptureService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's verse" })
  @ApiOkResponse({
    description: 'Scripture fetched successfully',
    type: DailyScriptureResponseDto,
  })
  async getTodaysScripture(
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.scriptureService.getTodaysScripture(religion);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('previous')
  @ApiOperation({ summary: 'Get previous days verses' })
  @ApiOkResponse({
    description: 'Verses fetched successfully',
    type: [DailyScriptureResponseDto],
  })
  @ApiQuery({ name: 'days', type: Number, required: true })
  async getPreviousScriptures(
    @Query('days') days: number,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.scriptureService.getPreviousDaysScriptures(days, religion);
    return this.response.sendResponse(res, serviceResponse);
  }
}
