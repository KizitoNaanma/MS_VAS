import { ApiProperty } from '@nestjs/swagger';
import { CourseEntity } from './course.entity';

export class CourseAuthorEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: () => CourseEntity,
    isArray: true,
    required: false,
  })
  courses?: CourseEntity[];
}
