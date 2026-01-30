import { ApiProperty, PickType } from '@nestjs/swagger';
import { PageDto, SimpleUserResponseDto } from 'src/common';
import { copyNonNullFields, getS3FileUrl } from 'src/modules/utils';
import { AttachmentEntity } from 'src/shared/database/prisma/generated/attachment.entity';
import { CreateMessageDto } from 'src/shared/database/prisma/generated/create-message.dto';
import { GroupEntity } from 'src/shared/database/prisma/generated/group.entity';
import { GroupMemberEntity } from 'src/shared/database/prisma/generated/groupMember.entity';
import { MessageEntity } from 'src/shared/database/prisma/generated/message.entity';

export class SimpleGroupResponseDto extends PickType(GroupEntity, [
  'id',
  'name',
  'description',
  'visibility',
  'createdAt',
]) {}

export class GroupMemberResponseDto extends PickType(GroupMemberEntity, [
  'id',
  'joinedAt',
]) {
  @ApiProperty({
    description: 'User',
    type: SimpleUserResponseDto,
  })
  user: SimpleUserResponseDto;
}

export class GroupResponseDto extends SimpleGroupResponseDto {
  @ApiProperty({
    description: 'Created by',
    type: SimpleUserResponseDto,
  })
  createdBy: SimpleUserResponseDto;
  @ApiProperty({
    description: 'Members',
    type: () => [GroupMemberResponseDto],
  })
  members: GroupMemberResponseDto[];
}

export class SimpleMessageResponseDto extends PickType(MessageEntity, [
  'id',
  'content',
  'createdAt',
]) {}

export class SimpleAttachmentResponseDto extends PickType(AttachmentEntity, [
  'id',
  'filename',
  'mimeType',
  'size',
]) {
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  url?: string | null;

  constructor(attachment: Partial<AttachmentEntity>) {
    super();
    copyNonNullFields(attachment, this, ['objectKey']);
    this.url = getS3FileUrl(attachment.objectKey);
  }
}

export class SimpleMessageEntity extends PickType(MessageEntity, [
  'id',
  'content',
  'groupId',
  'createdAt',
  'updatedAt',
]) {
  createdBy: SimpleUserResponseDto;
  attachments?: SimpleAttachmentResponseDto[];
}

export class SimpleMessageWithAttachmentsResponseDto extends SimpleMessageResponseDto {
  @ApiProperty({
    description: 'Attachments',
    type: () => [SimpleAttachmentResponseDto],
  })
  attachments: SimpleAttachmentResponseDto[];
  @ApiProperty({
    description: 'Author',
    type: SimpleUserResponseDto,
    required: false,
    nullable: true,
  })
  createdBy?: SimpleUserResponseDto;

  constructor(message: Partial<MessageEntity>) {
    super();
    copyNonNullFields(message, this);
  }
}

export class CreateMessageWithAttachmentsDto extends CreateMessageDto {
  @ApiProperty({
    description: 'Attachments',
    type: 'array',
    items: { type: 'file', format: 'binary' },
    required: false,
  })
  attachments?: Express.Multer.File[];
}

export class SimpleMessageWithAttachmentsPaginatedResponseDto extends PageDto<SimpleMessageWithAttachmentsResponseDto> {
  @ApiProperty({
    type: () => [SimpleMessageWithAttachmentsResponseDto],
  })
  data: SimpleMessageWithAttachmentsResponseDto[];
}
