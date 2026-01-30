import { ApiProperty } from '@nestjs/swagger';
import { MessageEntity } from './message.entity';

export class AttachmentEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  filename: string;
  @ApiProperty({
    type: 'string',
  })
  objectKey: string;
  @ApiProperty({
    type: 'string',
  })
  mimeType: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  size: number;
  @ApiProperty({
    type: () => MessageEntity,
    required: false,
  })
  message?: MessageEntity;
  @ApiProperty({
    type: 'string',
  })
  messageId: string;
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
