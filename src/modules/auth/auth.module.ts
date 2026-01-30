import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CacheServicesModule } from 'src/shared/cache/cache.module';
import { EmailProviderModule } from 'src/shared/email/email.module';
import { UtilsServicesModule } from 'src/modules/utils/utils.module';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    CacheServicesModule,
    EmailProviderModule,
    UtilsServicesModule,
    DatabaseServicesModule,
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
