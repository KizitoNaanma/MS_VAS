import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { WithdrawalRequestEntity } from './withdrawalRequest.entity';

export class BankAccountEntity {
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
    type: 'string',
  })
  accountNumber: string;
  @ApiProperty({
    type: 'string',
  })
  accountName: string;
  @ApiProperty({
    type: 'string',
  })
  bankName: string;
  @ApiProperty({
    type: 'string',
  })
  bankCode: string;
  @ApiProperty({
    type: 'boolean',
  })
  isDefault: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isVerified: boolean;
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
    type: () => WithdrawalRequestEntity,
    isArray: true,
    required: false,
  })
  withdrawalRequests?: WithdrawalRequestEntity[];
}
