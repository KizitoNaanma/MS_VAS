import { LessonStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { CourseEnrollmentEntity } from './courseEnrollment.entity';
import { CourseLessonEntity } from './courseLesson.entity';

export class CourseLessonProgressEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => CourseEnrollmentEntity,
    required: false,
  })
  enrollment?: CourseEnrollmentEntity;
  @ApiProperty({
    type: 'string',
  })
  enrollmentId: string;
  @ApiProperty({
    type: () => CourseLessonEntity,
    required: false,
  })
  lesson?: CourseLessonEntity;
  @ApiProperty({
    type: 'string',
  })
  lessonId: string;
  @ApiProperty({
    enum: LessonStatus,
  })
  status: LessonStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  startedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  lastAccessedAt: Date | null;
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
}
