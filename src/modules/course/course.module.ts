import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { ResponseUtilsService } from 'src/modules/utils';
import { CoursesAdminController } from './admin/courses.controller';
import { CoursesAdminService } from './admin/courses.service';
import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

@Module({
  imports: [DatabaseServicesModule],
  controllers: [CourseController, CoursesAdminController],
  providers: [
    CourseService,
    S3StorageService,
    ResponseUtilsService,
    CoursesAdminService,
  ],
})
export class CourseModule {}
