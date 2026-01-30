import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from 'src/common/constants/queues';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';
import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';
import { HttpServicesModule } from 'src/shared/http/http.module';
import { UserModule } from 'src/modules/user/user.module';

import { SubscriptionAuditProcessor } from './subscription-audit.processor';
import { SubscriptionContextBuilder } from './subscription-context.builder';
import { MarketerAttributionResolver } from './marketer-attribution.resolver';
import { AcquisitionChurnProcessor } from './acquisition-churn.processor';
import { PostbackService } from './postback.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.SECURE_D_RETRY,
    }),
    DatabaseServicesModule,
    IcellCoreModule,
    HttpServicesModule,
    UserModule,
  ],
  providers: [
    SubscriptionAuditProcessor,
    SubscriptionContextBuilder,
    MarketerAttributionResolver,
    AcquisitionChurnProcessor,
    PostbackService,
  ],
  exports: [
    SubscriptionAuditProcessor,
    SubscriptionContextBuilder,
    MarketerAttributionResolver,
    AcquisitionChurnProcessor,
    PostbackService,
  ],
})
export class SubscriptionAuditModule {}
