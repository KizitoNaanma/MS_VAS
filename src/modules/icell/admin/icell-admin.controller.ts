import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  RequiresAdminRole,
} from 'src/common';
import { ResponseUtilsService } from 'src/modules/utils';
import { IcellAdminService } from './icell-admin.service';
import { MarketersAnalyticsResponseDto } from 'src/common/dto/icell';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Icell-admin')
@Controller('admin/icell')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@AuthorizationRequired()
@RequiresAdminRole()
export class IcellAdminController {
  constructor(
    private readonly icellAdminService: IcellAdminService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('marketers/analytics')
  @ApiOperation({ summary: 'Get all marketers analytics' })
  @ApiOkResponse({
    description: 'Marketers analytics fetched successfully',
    type: MarketersAnalyticsResponseDto,
  })
  async getMarketers(@Res() res: Response) {
    const serviceResponse = await this.icellAdminService.getMarketers();
    return this.response.sendResponse(res, serviceResponse);
  }
}
