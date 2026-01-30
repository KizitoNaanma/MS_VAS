import { ApiProperty } from '@nestjs/swagger';

export class AddBankInformationDto {
  @ApiProperty({
    description: 'The code of the bank',
    example: '044',
  })
  bankCode: string;

  @ApiProperty({
    description: 'The account number',
    example: '0123456789',
  })
  accountNumber: string;

  @ApiProperty({
    description: 'The account name',
    example: 'John Doe',
  })
  accountName: string;
}

export class WithdrawalRequestDto {
  @ApiProperty({
    description: 'The amount to withdraw',
    example: 100,
  })
  amount: number;
}

export class ValidateBankAccountDetailsResponseDto {
  @ApiProperty({
    description: 'The account name',
    example: 'John Doe',
  })
  name: string;
}
