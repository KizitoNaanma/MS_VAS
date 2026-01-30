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
import { AdminScripturesService } from './scriptures.service';
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
import { ResponseUtilsService } from 'src/modules/utils';
import {
  AdminDailyScripturePaginatedResponseDto,
  AdminDailyScriptureResponseDto,
  AdminDailyScriptureUpdateDto,
} from 'src/common/dto/scripture';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Scriptures-admin')
@Controller('admin/scriptures')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@AuthorizationRequired()
@RequiresAdminRole()
export class AdminScripturesController {
  constructor(
    private readonly adminScripturesService: AdminScripturesService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all daily scriptures' })
  @ApiOkResponse({
    description: 'Daily scriptures fetched successfully',
    type: AdminDailyScripturePaginatedResponseDto,
  })
  async getDailyScriptures(
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.adminScripturesService.getDailyScriptures(pageOptionsDto);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a daily scripture by id' })
  @ApiOkResponse({
    description: 'Daily scripture fetched successfully',
    type: AdminDailyScriptureResponseDto,
  })
  async getDailyScripture(@Param('id') id: string, @Res() res: Response) {
    const serviceResponse =
      await this.adminScripturesService.getDailyScripture(id);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a daily scripture by id' })
  @ApiOkResponse({
    description: 'Daily scripture updated successfully',
    type: AdminDailyScriptureResponseDto,
  })
  async updateDailyScripture(
    @Param('id') id: string,
    @Body() payload: AdminDailyScriptureUpdateDto,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.adminScripturesService.updateDailyScripture(id, payload);
    return this.response.sendResponse(res, serviceResponse);
  }
}
