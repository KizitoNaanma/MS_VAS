import { Module } from '@nestjs/common';
import { DevotionalService } from './devotional.service';
import { DevotionalController } from './devotional.controller';
import {
  JwtUtilsService,
  ResponseUtilsService,
  TimeUtilsService,
} from '../utils';
import { AdminDevotionalsController } from './admin/devotionals.controller';
import { AdminDevotionalsService } from './admin/devotionals.service';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';
import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';
@Module({
  imports: [DatabaseServicesModule, IcellCoreModule],
  providers: [
    DevotionalService,
    ResponseUtilsService,
    TimeUtilsService,
    JwtUtilsService,
    AdminDevotionalsService,
  ],
  controllers: [DevotionalController, AdminDevotionalsController],
})
export class DevotionalModule {}
