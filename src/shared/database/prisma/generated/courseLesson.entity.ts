import { ApiProperty } from '@nestjs/swagger';
import { CourseEntity } from './course.entity';
import { CourseLessonProgressEntity } from './courseLessonProgress.entity';

export class CourseLessonEntity {
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
  content: string;
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
    type: 'integer',
    format: 'int32',
  })
  ordering: number;
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
  courseLessonProgress?: CourseLessonProgressEntity[];
}
