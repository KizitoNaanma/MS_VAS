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
import { AdminPrayersService } from './prayers.service';
import { ResponseUtilsService } from 'src/modules/utils';
import {
  AdminDailyPrayerPaginatedResponseDto,
  AdminDailyPrayerResponseDto,
  AdminDailyPrayerUpdateDto,
} from 'src/common/dto/prayer';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Prayers-admin')
@Controller('admin/prayers')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@AuthorizationRequired()
@RequiresAdminRole()
export class AdminPrayersController {
  constructor(
    private readonly adminPrayersService: AdminPrayersService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all prayers' })
  @ApiOkResponse({
    description: 'Prayers fetched successfully',
    type: AdminDailyPrayerPaginatedResponseDto,
  })
  async getDailyPrayers(
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.adminPrayersService.getDailyPrayers(pageOptionsDto);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a prayer by id' })
  @ApiOkResponse({
    description: 'Prayer fetched successfully',
    type: AdminDailyPrayerResponseDto,
  })
  async getDailyPrayer(@Param('id') id: string, @Res() res: Response) {
    const serviceResponse = await this.adminPrayersService.getDailyPrayer(id);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a prayer by id' })
  @ApiOkResponse({
    description: 'Prayer updated successfully',
    type: AdminDailyPrayerResponseDto,
  })
  async updateDailyPrayer(
    @Param('id') id: string,
    @Body() payload: AdminDailyPrayerUpdateDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.adminPrayersService.updateDailyPrayer(
      id,
      payload,
    );
    return this.response.sendResponse(res, serviceResponse);
  }
}
