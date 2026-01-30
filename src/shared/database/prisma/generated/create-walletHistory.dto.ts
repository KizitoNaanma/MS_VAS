import { Prisma, WalletTransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWalletHistoryDto {
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  @IsNotEmpty()
  @IsDecimal()
  amount: Prisma.Decimal;
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  @IsNotEmpty()
  @IsDecimal()
  balanceAfter: Prisma.Decimal;
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  @IsNotEmpty()
  @IsDecimal()
  balanceBefore: Prisma.Decimal;
  @ApiProperty({
    enum: WalletTransactionType,
  })
  @IsNotEmpty()
  transactionType: WalletTransactionType;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
}
