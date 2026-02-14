import { Module } from '@nestjs/common';
import { WheelOfFortuneController } from './wheel-of-fortune.controller';
import { WheelOfFortuneService } from './wheel-of-fortune.service';
import { PaymentModule } from '../payment/payment.module';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';
import { UtilsServicesModule } from '../utils/utils.module';

@Module({
  imports: [
    DatabaseServicesModule,
    PaymentModule,
    UtilsServicesModule,
  ],
  controllers: [WheelOfFortuneController],
  providers: [WheelOfFortuneService],
  exports: [WheelOfFortuneService],
})
export class WheelOfFortuneModule {}
