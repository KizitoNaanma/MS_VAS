import { GroupRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { GroupEntity } from './group.entity';
import { UserEntity } from './user.entity';

export class GroupMemberEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
  user?: UserEntity;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  joinedAt: Date;
  @ApiProperty({
    enum: GroupRole,
  })
  role: GroupRole;
}
