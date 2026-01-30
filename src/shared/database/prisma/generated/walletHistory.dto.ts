import { Prisma, WalletTransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class WalletHistoryDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}
