import { ApiProperty } from '@nestjs/swagger';
import { ReligionEntity } from './religion.entity';
import { CourseEntity } from './course.entity';
import { CourseTopicEntity } from './courseTopic.entity';

export class CourseCategoryEntity {
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
    type: () => CourseTopicEntity,
    isArray: true,
    required: false,
  })
  courseTopics?: CourseTopicEntity[];
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
