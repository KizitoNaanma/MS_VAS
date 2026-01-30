import { ApiProperty } from '@nestjs/swagger';

export class CourseAuthorDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
}
