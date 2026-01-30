import { Module } from '@nestjs/common';
import { IcellController } from './icell.controller';
import { IcellService } from './icell.service';
import { BullModule } from '@nestjs/bullmq';
import { QueueingServicesModule } from 'src/shared/queueing-services/queueing-services.module';
import { IcellProcessor } from './icell.processor';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { EmailProviderModule } from 'src/shared/email/email.module';
import { UtilsServicesModule } from '../utils/utils.module';
import { CacheServicesModule } from 'src/shared/cache/cache.module';
import { S3StorageModule } from 'src/common/services/s3-storage/s3-storage.module';
import { QUEUES } from 'src/common/constants/queues';
import { IcellAdminService } from './admin/icell-admin.service';
import { IcellAdminController } from './admin/icell-admin.controller';
import { NotificationModule } from '../notification/notification.module';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';
import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.ICELL,
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
      },
    }),
    QueueingServicesModule,
    EmailProviderModule,
    UtilsServicesModule,
    CacheServicesModule,
    S3StorageModule,
    IcellCoreModule,
    NotificationModule,
    DatabaseServicesModule,
  ],
  controllers: [IcellController, IcellAdminController],
  providers: [
    IcellAdminService,
    IcellService,
    UserService,
    AuthService,
    IcellProcessor,
  ],
})
export class IcellModule {}
