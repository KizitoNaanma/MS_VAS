import { ApiProperty } from '@nestjs/swagger';

export class BankInformationDto {
  @ApiProperty({
    description: 'The name of the bank',
    example: 'Access Bank',
  })
  name: string;

  @ApiProperty({
    description: 'The alias of the bank',
    example: ['Access Bank', 'Access'],
  })
  alias: string[];

  @ApiProperty({
    description: 'The routing key of the bank',
    example: '044',
  })
  routingKey: string;

  @ApiProperty({
    description: 'The logo image of the bank',
    example: 'https://example.com/logo.png',
  })
  logoImage: string;

  @ApiProperty({
    description: 'The bank code of the bank',
    example: '044',
  })
  bankCode: string;

  @ApiProperty({
    description: 'The category id of the bank',
    example: '1',
  })
  categoryId: string;

  @ApiProperty({
    description: 'The nuban code of the bank',
    example: '044',
  })
  nubanCode: string;
}

export class BankInformationResponseDto {
  @ApiProperty({
    description: 'The list of banks',
    type: [BankInformationDto],
  })
  data: BankInformationDto[];
}

export class BankTransferResponseDto {
  @ApiProperty({
    description: 'The id of the transaction from OnionPay',
    example: '6b9d2d83-d84e-45d3-889f-6fad23b22c67',
  })
  transactionId: string;

  @ApiProperty({
    description: 'The session id of the transaction from NIBSS',
    example: '000013250226103938007',
  })
  sessionId: string;
}

export enum WebhookTransactionStatus {
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  REVERSED = 'reversed',
  PENDING = 'pending',
}

export enum WebhookEvent {
  PAYMENT_RECEIVED = 'payment-received',
  TRANSFER_COMPLETED = 'transfer-completed',
  AIRTIME_PURCHASED = 'airtime-purchased',
}

export class WebhookTransactionDto {
  @ApiProperty({
    description: 'The reference of the transaction',
    example: 'F5KZZNBFYU',
  })
  reference: string;

  @ApiProperty({
    description: 'The created at of the transaction',
    example: '2025-02-26T09:38:45.703Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'The business id of the transaction',
    example: '6b9d2d83-d84e-45d3-889f-5edb48c31b59',
  })
  businessId: string;

  @ApiProperty({
    description: 'The amount of the transaction',
    example: 50,
  })
  amount: number;

  @ApiProperty({
    description: 'The narration of the transaction',
    example: 'NIP Transfer to Onion Digital Service Limited',
  })
  narration: string;

  @ApiProperty({
    description: 'The description of the transaction',
    example: 'Transaction Description',
  })
  description: string;

  @ApiProperty({
    description: 'The status of the transaction',
    enum: WebhookTransactionStatus,
    example: WebhookTransactionStatus.SUCCESSFUL,
  })
  status: WebhookTransactionStatus;

  @ApiProperty({
    description: 'The session id of the transaction',
    example: '000013250226103938007',
  })
  sessionId: string;

  @ApiProperty({
    description: 'The operation of the transaction',
    example: 'payment',
  })
  operation: string;
}

export class WebhookPayloadDto {
  @ApiProperty({
    description: 'The transaction of the payload',
    type: WebhookTransactionDto,
  })
  transaction: WebhookTransactionDto;

  @ApiProperty({
    description: 'The event of the payload',
    enum: WebhookEvent,
    example: WebhookEvent.PAYMENT_RECEIVED,
  })
  event: WebhookEvent;
}
