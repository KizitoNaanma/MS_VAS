import { ApiProperty } from '@nestjs/swagger';

export class BankAccountDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  accountNumber: string;
  @ApiProperty({
    type: 'string',
  })
  accountName: string;
  @ApiProperty({
    type: 'string',
  })
  bankName: string;
  @ApiProperty({
    type: 'string',
  })
  bankCode: string;
  @ApiProperty({
    type: 'boolean',
  })
  isDefault: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isVerified: boolean;
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
