import { Module } from '@nestjs/common';
import { MusicLibraryService } from './music-library.service';
import { MusicLibraryController } from './music-library.controller';
import { ResponseUtilsService } from '../utils';
import { MusicLibraryAdminController } from './admin/music-library-admin.controller';
import { MusicLibraryAdminService } from './admin/music-library-admin.service';
import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

@Module({
  imports: [DatabaseServicesModule],
  providers: [
    MusicLibraryService,
    ResponseUtilsService,
    MusicLibraryAdminService,
    S3StorageService,
  ],
  controllers: [MusicLibraryController, MusicLibraryAdminController],
})
export class MusicLibraryModule {}
