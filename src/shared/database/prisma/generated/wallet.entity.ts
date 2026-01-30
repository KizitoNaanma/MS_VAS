import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { WalletHistoryEntity } from './walletHistory.entity';
import { WithdrawalRequestEntity } from './withdrawalRequest.entity';

export class WalletEntity {
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
  balance: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  lastUpdated: Date;
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
    type: () => WalletHistoryEntity,
    isArray: true,
    required: false,
  })
  walletHistories?: WalletHistoryEntity[];
  @ApiProperty({
    type: () => WithdrawalRequestEntity,
    isArray: true,
    required: false,
  })
  withdrawals?: WithdrawalRequestEntity[];
}
