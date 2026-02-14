import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateWheelSpinDto {
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  @IsNotEmpty()
  @IsDecimal()
  amountWon: Prisma.Decimal;
  @ApiProperty({
    type: 'boolean',
  })
  @IsNotEmpty()
  @IsBoolean()
  isWin: boolean;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  rewardType?: string | null;
}
