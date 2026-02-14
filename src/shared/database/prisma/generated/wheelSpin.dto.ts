import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class WheelSpinDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
