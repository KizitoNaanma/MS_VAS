import { Module } from '@nestjs/common';
import { S3StorageService } from './s3-storage.service';

@Module({
  providers: [S3StorageService],
  exports: [S3StorageService], // Export for use in other modules
})
export class S3StorageModule {}
