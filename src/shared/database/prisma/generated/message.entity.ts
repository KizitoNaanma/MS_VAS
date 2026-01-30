import { ApiProperty } from '@nestjs/swagger';
import { GroupEntity } from './group.entity';
import { UserEntity } from './user.entity';
import { AttachmentEntity } from './attachment.entity';

export class MessageEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  content: string;
  @ApiProperty({
    type: () => GroupEntity,
    required: false,
  })
  group?: GroupEntity;
  @ApiProperty({
    type: 'string',
  })
  groupId: string;
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
    type: () => AttachmentEntity,
    isArray: true,
    required: false,
  })
  attachments?: AttachmentEntity[];
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
