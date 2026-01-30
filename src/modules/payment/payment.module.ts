import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OnionPayService } from 'src/common/services/provider-services/onionpay';
import { CacheServicesModule } from 'src/shared/cache/cache.module';
import { UtilsServicesModule } from '../utils/utils.module';
import { HttpServicesModule } from 'src/shared/http/http.module';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

@Module({
  imports: [
    DatabaseServicesModule,
    UtilsServicesModule,
    CacheServicesModule,
    HttpServicesModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, OnionPayService],
  exports: [PaymentService, OnionPayService],
})
export class PaymentModule {}
