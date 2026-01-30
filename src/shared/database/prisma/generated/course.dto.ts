import { ApiProperty } from '@nestjs/swagger';

export class CourseDto {
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
