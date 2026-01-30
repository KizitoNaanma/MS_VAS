import { Module } from '@nestjs/common';
import { SecureDController } from './secure-d.controller';
import { SecureDService } from './secure-d.service';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from 'src/common/constants/queues';
import { NotificationModule } from '../notification/notification.module';
import { SecureDRetryProcessor } from './secure-d-retry.processor';
import { SubscriptionAuditModule } from '../subscription/audit/subscription-audit.module';
import { SecureDProcessor } from './secure-d.processor';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.SECURE_D,
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
      },
    }),
    NotificationModule,
    DatabaseServicesModule,
    SubscriptionAuditModule,
  ],
  controllers: [SecureDController],
  providers: [SecureDRetryProcessor, SecureDProcessor, SecureDService],
  exports: [SecureDService],
})
export class SecureDModule {}
