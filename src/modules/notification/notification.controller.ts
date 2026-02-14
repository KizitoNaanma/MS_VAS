import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  SubscriptionRequired,
} from 'src/common';
import { ResponseUtilsService } from 'src/modules/utils';
import { IServiceResponse } from 'src/common';
import { QuizWinningsNotificationResponseDto } from 'src/common/dto/notification';

@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('notification')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@SubscriptionRequired()
@AuthorizationRequired()
export class NotificationController {
  constructor(private readonly response: ResponseUtilsService) {}

  @Get('quiz-winnings')
  @ApiOperation({ summary: 'Get quiz winnings notifications' })
  @ApiOkResponse({
    description: 'Successfully retrieved quiz winnings notifications',
    type: QuizWinningsNotificationResponseDto,
  })
  async getQuizWinningsNotification(@Res() res: Response) {
    const response: IServiceResponse<QuizWinningsNotificationResponseDto> = {
      success: true,
      message: 'No new quiz winnings notifications',
      data: {
        hasNewWinnings: false,
        message: 'You have no new quiz winnings to claim at this time.',
      },
    };

    // data: {
    //     hasNewWinnings: true,
    //     message: 'You have new quiz winnings to claim at this time.',
    //   },

    return this.response.sendResponse(res, response);
  }
}
