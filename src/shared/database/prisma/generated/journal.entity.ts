import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

export class JournalEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
  })
  body: string;
  @ApiProperty({
    type: () => UserEntity,
    required: false,
  })
  createdBy?: UserEntity;
  @ApiProperty({
    type: 'string',
  })
  createdById: string;
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
