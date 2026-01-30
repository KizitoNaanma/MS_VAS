import { ApiProperty } from '@nestjs/swagger';

export class ReligionDto {
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
    type: 'string',
  })
  noun: string;
  @ApiProperty({
    type: 'string',
  })
  adjective: string;
  @ApiProperty({
    description: 'The date the religion was created',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    description: 'The date the religion was last updated',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
