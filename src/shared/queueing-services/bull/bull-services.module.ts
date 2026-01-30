import { Module } from '@nestjs/common';
import bullRedisConfig from './bull-config';
import { BullModule } from '@nestjs/bullmq';
@Module({
  imports: [
    BullModule.forRoot({
      connection: bullRedisConfig.redis as any,
      defaultJobOptions: bullRedisConfig.defaultJobOptions,
    }),
  ],
})
export class BullServicesModule {}
