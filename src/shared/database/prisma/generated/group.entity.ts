import { GroupVisibility } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ReligionEntity } from './religion.entity';
import { UserEntity } from './user.entity';
import { MessageEntity } from './message.entity';
import { GroupMemberEntity } from './groupMember.entity';

export class GroupEntity {
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
    enum: GroupVisibility,
  })
  visibility: GroupVisibility;
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
  @ApiProperty({
    type: () => MessageEntity,
    isArray: true,
    required: false,
  })
  messages?: MessageEntity[];
  @ApiProperty({
    type: () => GroupMemberEntity,
    isArray: true,
    required: false,
  })
  members?: GroupMemberEntity[];
}
