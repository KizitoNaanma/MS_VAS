import { Controller, Post, Body, Res } from '@nestjs/common';
import {
  IcellDatasyncRequestDto,
  IncomingSmsNotificationDto,
} from 'src/common/dto/icell';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { ICELL_PROCESSOR_JOBS, QUEUES } from 'src/common/constants/queues';
import { Queue } from 'bullmq';
import { WebhookNotificationService } from '../notification/webhook-notification.service';
import { TrafficTrackerService } from '../notification/traffic-tracker.service';
import { env } from 'src/common/env';
@ApiTags('Icell')
@Controller('icell')
export class IcellController {
  constructor(
    private readonly webhookNotificationService: WebhookNotificationService,
    private readonly trafficTrackerService: TrafficTrackerService,
    @InjectQueue(QUEUES.ICELL) private icellQueue: Queue,
  ) {}

  @Post('sms/notification')
  @ApiOperation({ summary: 'Process SMS notification' })
  @ApiOkResponse({
    description: 'SMS notification processed successfully',
  })
  async smsNotification(
    @Body() body: IncomingSmsNotificationDto,
    @Res() res: Response,
  ) {
    if (env.isProd) {
      await this.webhookNotificationService.logJson(
        `Processing SMS Notification: [${env.env.toUpperCase()}]`,
        body,
      );
    }
    await this.icellQueue.add(ICELL_PROCESSOR_JOBS.PROCESS_SMS_REQUEST, {
      payload: body,
    });

    return res.status(200).json({ status: 'OK' });
  }

  @Post('datasync/notification')
  @ApiOperation({ summary: 'Process Datasync notification' })
  @ApiOkResponse({
    description: 'Datasync notification processed successfully',
  })
  async datasyncNotification(
    @Body() request: IcellDatasyncRequestDto,
    @Res() res: Response,
  ) {
    // Track traffic for monitoring
    if (env.isProd) {
      await this.trafficTrackerService.recordDatasyncHit();
    }
    if (env.isProd) {
      await this.webhookNotificationService.logJson(
        `Processing Datasync Notification: [${env.env.toUpperCase()}]`,
        request,
      );
    }
    await this.icellQueue.add(ICELL_PROCESSOR_JOBS.PROCESS_DATASYNC_REQUEST, {
      payload: request,
    });

    return res.status(200).json({ status: 'OK' });
  }
}
