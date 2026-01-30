import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ResponseUtilsService } from '../utils';
import { WebhookNotificationService } from './webhook-notification.service';
import { TrafficTrackerService } from './traffic-tracker.service';
import { TrafficMonitorService } from './traffic-monitor.service';
import { TrafficMonitorProcessor } from './traffic-monitor.processor';
import { QUEUES } from 'src/common/constants/queues';
import { RedisServiceModule } from 'src/shared/cache/redis/redis-manager-service.module';
import { EmailProviderModule } from 'src/shared/email/email.module';
import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';

@Module({
  imports: [
    RedisServiceModule,
    BullModule.registerQueue({
      name: QUEUES.TRAFFIC_MONITOR,
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    }),
    IcellCoreModule,
    EmailProviderModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    ResponseUtilsService,
    WebhookNotificationService,
    TrafficTrackerService,
    TrafficMonitorService,
    TrafficMonitorProcessor,
  ],
  exports: [
    WebhookNotificationService,
    TrafficTrackerService,
    NotificationService,
  ],
})
export class NotificationModule {}
