import { Module } from '@nestjs/common';
import { MindfulnessResourceController } from './mindfulness-resource.controller';
import { MindfulnessResourceService } from './mindfulness-resource.service';
import { ResponseUtilsService } from '../utils';
import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';
import { MindfulnessResourcesAdminService } from './admin/mindfulness-resource-admin.service';
import { MindfulnessResourcesController } from './admin/mindfulness-resource-admin.controller';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';
@Module({
  imports: [DatabaseServicesModule, IcellCoreModule],
  providers: [
    MindfulnessResourceService,
    ResponseUtilsService,
    S3StorageService,
    MindfulnessResourcesAdminService,
  ],
  controllers: [MindfulnessResourceController, MindfulnessResourcesController],
})
export class MindfulnessResourceModule {}
