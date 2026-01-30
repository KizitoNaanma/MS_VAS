import { Prisma, PaymentStatus, TransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { SubscriptionEntity } from './subscription.entity';

export class TransactionEntity {
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
  amount: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
  })
  currency: string;
  @ApiProperty({
    enum: PaymentStatus,
  })
  status: PaymentStatus;
  @ApiProperty({
    enum: TransactionType,
  })
  type: TransactionType;
  @ApiProperty({
    type: 'string',
  })
  productId: string;
  @ApiProperty({
    type: 'string',
  })
  productName: string;
  @ApiProperty({
    type: 'string',
  })
  channel: string;
  @ApiProperty({
    type: 'string',
  })
  reference: string;
  @ApiProperty({
    type: () => SubscriptionEntity,
    isArray: true,
    required: false,
  })
  subscription?: SubscriptionEntity[];
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
