import { Prisma, EnrollmentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { CourseEntity } from './course.entity';
import { CourseLessonProgressEntity } from './courseLessonProgress.entity';

export class CourseEnrollmentEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => UserEntity,
    required: false,
  })
  user?: UserEntity;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    type: () => CourseEntity,
    required: false,
  })
  course?: CourseEntity;
  @ApiProperty({
    type: 'string',
  })
  courseId: string;
  @ApiProperty({
    enum: EnrollmentStatus,
  })
  status: EnrollmentStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  startedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  lastAccessedAt: Date;
  @ApiProperty({
    description: 'The percentage of the course completed',
    type: 'number',
    format: 'double',
  })
  progress: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: () => CourseLessonProgressEntity,
    isArray: true,
    required: false,
  })
  lessonProgress?: CourseLessonProgressEntity[];
}
