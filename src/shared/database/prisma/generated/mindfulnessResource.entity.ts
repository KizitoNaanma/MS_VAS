import { ApiProperty } from '@nestjs/swagger';
import { MindfulnessResourceCategoryEntity } from './mindfulnessResourceCategory.entity';

export class MindfulnessResourceEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: () => MindfulnessResourceCategoryEntity,
    required: false,
  })
  category?: MindfulnessResourceCategoryEntity;
  @ApiProperty({
    type: 'string',
  })
  categoryId: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  textContent: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  audioObjectKey: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageObjectKey: string | null;
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
