import { ApiProperty } from '@nestjs/swagger';

export class SecureDNotificationRequestDto {
  @ApiProperty({
    description: 'The msisdn',
    example: '+2348060000000',
  })
  msisdn: string;

  @ApiProperty({
    description:
      'The activation: 1 for activation, 0 (others) for deactivation',
    example: '1',
  })
  activation: string;

  @ApiProperty({
    description: 'The product id',
    example: '23401220000031450',
  })
  productID: string;

  @ApiProperty({
    description: 'The description: success or error details',
    example: 'Success',
  })
  description: string;

  @ApiProperty({
    description: 'The timestamp',
    example: '2025-01-01 12:00:00',
  })
  timestamp: string;

  @ApiProperty({
    description:
      'The trx id: contains marketer information, clickId and sourceId',
    example: 'ONEO1-1234567890-1234567890',
  })
  trxId: string;
}
