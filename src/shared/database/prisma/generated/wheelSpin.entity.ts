import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

export class WheelSpinEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
    type: 'number',
    format: 'double',
  })
  amountWon: Prisma.Decimal;
  @ApiProperty({
    type: 'boolean',
  })
  isWin: boolean;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  rewardType: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  spunAt: Date;
}
