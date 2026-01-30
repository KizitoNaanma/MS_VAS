import { ApiProperty } from '@nestjs/swagger';
import { ReligionEntity } from './religion.entity';

export class QuoteEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  content: string;
  @ApiProperty({
    type: 'string',
  })
  author: string;
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
