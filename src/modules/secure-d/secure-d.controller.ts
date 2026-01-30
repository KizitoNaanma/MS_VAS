import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { QUEUES, SECURE_D_PROCESSOR_JOBS } from 'src/common/constants/queues';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { env } from 'src/common';
import { Response } from 'express';
import { SecureDNotificationRequestDto } from 'src/common/dto/secure-d';
import { WebhookNotificationService } from '../notification/webhook-notification.service';
import { TrafficTrackerService } from '../notification/traffic-tracker.service';

@ApiTags('SecureD')
@Controller('secure-d')
export class SecureDController {
  constructor(
    private readonly webhookNotificationService: WebhookNotificationService,
    private readonly trafficTrackerService: TrafficTrackerService,
    @InjectQueue(QUEUES.SECURE_D) private secureDQueue: Queue,
  ) {}

  @Post('notification')
  @ApiOperation({ summary: 'Process SecureD notification' })
  @ApiOkResponse({
    description: 'SecureD notification processed successfully',
  })
  async notification(
    @Body() request: SecureDNotificationRequestDto,
    @Res() res: Response,
  ) {
    // Track traffic for monitoring
    if (env.isProd) {
      await this.trafficTrackerService.recordSecureDHit();
    }

    if (env.isProd) {
      await this.webhookNotificationService.logJson(
        `Processing SecureD Notification: [${env.env.toUpperCase()}]`,
        request,
      );
    }
    await this.secureDQueue.add(
      SECURE_D_PROCESSOR_JOBS.PROCESS_SECURE_D_NOTIFICATION,
      {
        payload: request,
      },
    );

    return res.status(200).json({ status: 'OK' });
  }
}
