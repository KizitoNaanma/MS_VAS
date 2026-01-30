import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BankAccountUserIdAccountNumberUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;
}

@ApiExtraModels(BankAccountUserIdAccountNumberUniqueInputDto)
export class ConnectBankAccountDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: BankAccountUserIdAccountNumberUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankAccountUserIdAccountNumberUniqueInputDto)
  userId_accountNumber?: BankAccountUserIdAccountNumberUniqueInputDto;
}
