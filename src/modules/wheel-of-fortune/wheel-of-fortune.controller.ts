import { Controller, Get, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthorizationRequired, CurrentUser, SubscriptionRequired } from 'src/common';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { ResponseUtilsService } from '../utils';
import { WheelOfFortuneService } from './wheel-of-fortune.service';
import { Response } from 'express';

@ApiTags('Wheel of Fortune')
@ApiBearerAuth()
@Controller('wheel-of-fortune')
@AuthorizationRequired()
export class WheelOfFortuneController {
  constructor(
    private readonly wheelService: WheelOfFortuneService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get current spin status' })
  async getStatus(@CurrentUser() user: UserEntity, @Res() res: Response) {
    const serviceResponse = await this.wheelService.getStatus(user);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post('spin')
  @SubscriptionRequired()
  @ApiOperation({ summary: 'Spin the wheel' })
  async spin(@CurrentUser() user: UserEntity, @Res() res: Response) {
    const serviceResponse = await this.wheelService.spin(user);
    return this.response.sendResponse(res, serviceResponse);
  }
}
