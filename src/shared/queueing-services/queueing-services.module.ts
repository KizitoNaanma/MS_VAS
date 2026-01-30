import { Module } from '@nestjs/common';
import { BullServicesModule } from './bull/bull-services.module';

@Module({
  imports: [BullServicesModule],
  exports: [BullServicesModule],
})
export class QueueingServicesModule {}
