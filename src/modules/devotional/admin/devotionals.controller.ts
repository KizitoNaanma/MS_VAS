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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  PageOptionsDto,
  RequiresAdminRole,
} from 'src/common';
import { AdminDevotionalsService } from './devotionals.service';
import { ResponseUtilsService } from 'src/modules/utils';
import { Response } from 'express';
import {
  AdminDailyDevotionalPaginatedResponseDto,
  AdminDailyDevotionalResponseDto,
  AdminDailyDevotionalUpdateDto,
} from 'src/common/dto/devotional';

@ApiBearerAuth()
@ApiTags('Devotionals-admin')
@Controller('admin/devotionals')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@AuthorizationRequired()
@RequiresAdminRole()
export class AdminDevotionalsController {
  constructor(
    private readonly adminDevotionalsService: AdminDevotionalsService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all devotionals' })
  @ApiOkResponse({
    description: 'Devotionals fetched successfully',
    type: AdminDailyDevotionalPaginatedResponseDto,
  })
  async getDailyDevotionals(
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.adminDevotionalsService.getDailyDevotionals(pageOptionsDto);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a devotional by id' })
  @ApiOkResponse({
    description: 'Devotional retrieved successfully',
    type: AdminDailyDevotionalResponseDto,
  })
  async getDailyDevotional(@Param('id') id: string, @Res() res: Response) {
    const serviceResponse =
      await this.adminDevotionalsService.getDailyDevotional(id);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a devotional by id' })
  @ApiOkResponse({
    description: 'Devotional updated successfully',
    type: AdminDailyDevotionalResponseDto,
  })
  async updateDailyDevotional(
    @Param('id') id: string,
    @Body() payload: AdminDailyDevotionalUpdateDto,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.adminDevotionalsService.updateDailyDevotional(id, payload);
    return this.response.sendResponse(res, serviceResponse);
  }
}
