import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class WalletDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
}
