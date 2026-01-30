import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { UserService } from '../user/user.service';
import { UtilsServicesModule } from '../utils/utils.module';
import { S3StorageModule } from 'src/common/services/s3-storage/s3-storage.module';
import { AuthService } from '../auth/auth.service';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';
import { CacheServicesModule } from 'src/shared/cache/cache.module';
import { EmailProviderModule } from 'src/shared/email/email.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from 'src/common/constants/queues';
import { SubscriptionCronService } from './scheduling/subscription-cron.service';
import { SubscriptionController } from './subscription.controller';
import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';
import { SubscriptionOrchestrator } from './subscription.orchestrator';
import { SubscriptionCronProcessor } from './scheduling/subscription-cron.processor';
import { SecureDModule } from '../secure-d/secure-d.module';
import { HttpServicesModule } from 'src/shared/http/http.module';
import { SubscriptionAuditModule } from './audit/subscription-audit.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.SUBSCRIPTION_SCHEDULED_JOBS,
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
      },
    }),
    S3StorageModule,
    CacheServicesModule,
    EmailProviderModule,
    UtilsServicesModule,
    DatabaseServicesModule,
    IcellCoreModule,
    SecureDModule,
    HttpServicesModule,
    SubscriptionAuditModule,
    NotificationModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    // Core services
    SubscriptionService,
    SubscriptionOrchestrator,

    // Scheduling
    SubscriptionCronProcessor,
    SubscriptionCronService,

    // Auth
    AuthService,

    // User
    UserService,
  ],
})
export class SubscriptionModule {}
