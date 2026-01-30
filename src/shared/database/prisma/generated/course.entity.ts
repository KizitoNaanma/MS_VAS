import { ApiProperty } from '@nestjs/swagger';
import { ReligionEntity } from './religion.entity';
import { CourseCategoryEntity } from './courseCategory.entity';
import { CourseAuthorEntity } from './courseAuthor.entity';
import { CourseTopicEntity } from './courseTopic.entity';
import { CourseLessonEntity } from './courseLesson.entity';
import { CourseEnrollmentEntity } from './courseEnrollment.entity';

export class CourseEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  description: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  videoObjectKey: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageObjectKey: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  duration: number | null;
  @ApiProperty({
    type: 'boolean',
  })
  isFree: boolean;
  @ApiProperty({
    type: () => ReligionEntity,
    required: false,
  })
  religion?: ReligionEntity;
  @ApiProperty({
    type: 'string',
  })
  religionId: string;
  @ApiProperty({
    type: () => CourseCategoryEntity,
    required: false,
  })
  category?: CourseCategoryEntity;
  @ApiProperty({
    type: 'string',
  })
  categoryId: string;
  @ApiProperty({
    type: () => CourseAuthorEntity,
    required: false,
    nullable: true,
  })
  author?: CourseAuthorEntity | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  authorId: string | null;
  @ApiProperty({
    type: () => CourseTopicEntity,
    required: false,
  })
  courseTopic?: CourseTopicEntity;
  @ApiProperty({
    type: 'string',
  })
  courseTopicId: string;
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
    type: () => CourseLessonEntity,
    isArray: true,
    required: false,
  })
  lessons?: CourseLessonEntity[];
  @ApiProperty({
    type: () => CourseEnrollmentEntity,
    isArray: true,
    required: false,
  })
  courseEnrollments?: CourseEnrollmentEntity[];
}
