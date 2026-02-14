import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { ResponseUtilsService } from '../utils';
import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';
@Module({
  imports: [DatabaseServicesModule, IcellCoreModule],
  controllers: [GroupController],
  providers: [GroupService, ResponseUtilsService, S3StorageService],
})
export class GroupModule {}
