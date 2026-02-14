import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdateWheelSpinDto {
  @ApiProperty({
    type: 'number',
    format: 'double',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  amountWon?: Prisma.Decimal;
  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isWin?: boolean;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  rewardType?: string | null;
}
