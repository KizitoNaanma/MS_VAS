import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class WheelSpinStatusResponseDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  hasSubscription: boolean;

  @ApiProperty({ example: 1 })
  @IsNumber()
  spinsToday: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  canSpin: boolean;

  @ApiProperty({ example: 'You have used your free spin today. Extra spins cost N50.' })
  @IsString()
  @IsOptional()
  message?: string;
}

export class WheelSpinResultResponseDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isWin: boolean;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  amountWon: number;

  @ApiProperty({ example: 'CASH' })
  @IsString()
  @IsOptional()
  rewardType?: string;

  @ApiProperty({ example: 'Congratulations! You won N50.' })
  @IsString()
  message: string;
}
