import { GroupRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class GroupMemberDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
