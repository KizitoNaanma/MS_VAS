import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CacheServicesModule } from 'src/shared/cache/cache.module';
import { EmailProviderModule } from 'src/shared/email/email.module';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';
import { UtilsServicesModule } from 'src/modules/utils/utils.module';
import { ResponseUtilsService } from '../utils';
import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';
import { AuthService } from '../auth/auth.service';
import { AdminUsersController } from './admin/users.controller';
import { AdminUsersService } from './admin/users.service';
import { PaymentModule } from '../payment/payment.module';
import { HttpServicesModule } from 'src/shared/http/http.module';
import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PaymentModule,
    CacheServicesModule,
    EmailProviderModule,
    UtilsServicesModule,
    DatabaseServicesModule,
    HttpServicesModule,
    IcellCoreModule,
    NotificationModule,
  ],
  controllers: [UserController, AdminUsersController],
  providers: [
    UserService,
    AuthService,
    ResponseUtilsService,
    S3StorageService,
    AdminUsersService,
  ],
  exports: [UserService],
})
export class UserModule {}
