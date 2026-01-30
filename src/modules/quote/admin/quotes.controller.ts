import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import { AdminQuotesService } from './quotes.service';
import { ResponseUtilsService } from 'src/modules/utils';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  PageOptionsDto,
  RequiresAdminRole,
} from 'src/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import {
  AdminQuotePaginatedResponseDto,
  AdminQuoteResponseDto,
  AdminQuoteUpdateDto,
} from 'src/common/dto/quote';
import { SortFilterDto } from 'src/common/dto/filters';

@ApiBearerAuth()
@ApiTags('Quotes-admin')
@Controller('admin/quotes')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@AuthorizationRequired()
@RequiresAdminRole()
export class AdminQuotesController {
  constructor(
    private readonly adminQuotesService: AdminQuotesService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all quotes' })
  @ApiOkResponse({
    description: 'Quotes fetched successfully',
    type: AdminQuotePaginatedResponseDto,
  })
  async getDailyQuotes(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() sortDto: SortFilterDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.adminQuotesService.getDailyQuotes(
      pageOptionsDto,
      sortDto,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quote by id' })
  @ApiOkResponse({
    description: 'Quote fetched successfully',
    type: AdminQuoteResponseDto,
  })
  async getDailyQuote(@Param('id') id: string, @Res() res: Response) {
    const serviceResponse = await this.adminQuotesService.getDailyQuote(id);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quote by id' })
  @ApiOkResponse({
    description: 'Quote updated successfully',
    type: AdminQuoteResponseDto,
  })
  async updateDailyQuote(
    @Param('id') id: string,
    @Body() payload: AdminQuoteUpdateDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.adminQuotesService.updateDailyQuote(
      id,
      payload,
    );
    return this.response.sendResponse(res, serviceResponse);
  }
}
