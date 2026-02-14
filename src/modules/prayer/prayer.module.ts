import { Module } from '@nestjs/common';
import { PrayerController } from './prayer.controller';
import { PrayerService } from './prayer.service';
import {
  JwtUtilsService,
  ResponseUtilsService,
  TimeUtilsService,
} from '../utils';
import { AdminPrayersController } from './admin/prayers.controller';
import { AdminPrayersService } from './admin/prayers.service';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';
@Module({
  imports: [DatabaseServicesModule, IcellCoreModule],
  providers: [
    PrayerService,
    ResponseUtilsService,
    TimeUtilsService,
    JwtUtilsService,
    AdminPrayersService,
  ],
  controllers: [PrayerController, AdminPrayersController],
})
export class PrayerModule {}
