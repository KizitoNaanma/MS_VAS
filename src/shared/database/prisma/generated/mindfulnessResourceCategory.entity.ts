import { ApiProperty } from '@nestjs/swagger';
import { ReligionEntity } from './religion.entity';
import { MindfulnessResourceEntity } from './mindfulnessResource.entity';

export class MindfulnessResourceCategoryEntity {
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
    type: () => MindfulnessResourceEntity,
    isArray: true,
    required: false,
  })
  MindfulnessResource?: MindfulnessResourceEntity[];
}
