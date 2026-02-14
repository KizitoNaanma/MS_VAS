import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
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
import { Religion } from '@prisma/client';
import { CurrentUserReligion } from 'src/common/decorators/current-user-religion.decorator';
import { QuoteResponseDto } from 'src/common/dto/quote';
import { ResponseUtilsService } from '../utils';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Quotes')
@Controller('quotes')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@SubscriptionRequired()
@AuthorizationRequired()
@UseInterceptors(CurrentUserReligionInterceptor)
export class QuoteController {
  constructor(
    private readonly quoteService: QuoteService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get quotes' })
  @ApiOkResponse({
    description: 'Quotes fetched successfully',
    type: [QuoteResponseDto],
  })
  @ApiQuery({ name: 'count', type: Number, required: false })
  async getQuotes(
    @CurrentUserReligion() religion: Religion,
    @Query('count') count: number,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.quoteService.getDailyQuotes(
      religion,
      count || 5,
    );
    return this.response.sendResponse(res, serviceResponse);
  }
}
