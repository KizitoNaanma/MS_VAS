import { Prisma, WalletTransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { WalletEntity } from './wallet.entity';
import { QuizAttemptEntity } from './quizAttempt.entity';

export class WalletHistoryEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => WalletEntity,
    required: false,
  })
  wallet?: WalletEntity;
  @ApiProperty({
    type: 'string',
  })
  walletId: string;
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  amount: Prisma.Decimal;
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  balanceAfter: Prisma.Decimal;
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  balanceBefore: Prisma.Decimal;
  @ApiProperty({
    enum: WalletTransactionType,
  })
  transactionType: WalletTransactionType;
  @ApiProperty({
    type: 'string',
  })
  description: string;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  metadata: Prisma.JsonValue | null;
  @ApiProperty({
    type: () => QuizAttemptEntity,
    required: false,
    nullable: true,
  })
  quizAttempt?: QuizAttemptEntity | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  quizAttemptId: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}
