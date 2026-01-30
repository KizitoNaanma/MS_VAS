import { ApiProperty } from '@nestjs/swagger';
import { ReligionEntity } from './religion.entity';
import { CourseEntity } from './course.entity';
import { CourseCategoryEntity } from './courseCategory.entity';

export class CourseTopicEntity {
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
  code: string;
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
    type: () => CourseEntity,
    isArray: true,
    required: false,
  })
  courses?: CourseEntity[];
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
    type: () => CourseCategoryEntity,
    required: false,
  })
  courseCategory?: CourseCategoryEntity;
  @ApiProperty({
    type: 'string',
  })
  courseCategoryId: string;
}
