import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString } from 'class-validator';

// src/icell/dto/sms.dto.ts
export class IncomingSmsNotificationDto {
  @ApiProperty({
    description: 'The message to send',
    example: 'CW',
  })
  message: string;

  @ApiProperty({
    description: 'The phone number that received the message',
    example: '10045',
  })
  @IsString()
  receiverAddress: string;

  @ApiProperty({
    description: 'Whether to request a delivery receipt',
    example: true,
    default: true,
  })
  requestDeliveryReceipt: boolean;

  @ApiProperty({
    description: 'The sender phone number',
    example: '2348012345678',
  })
  @IsString()
  senderAddress: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: 1745468017403,
  })
  created: number;

  @ApiProperty({
    description: 'Unique message identifier',
    example: 'NGA7b7613c1-b529-4eab-9d58-cdb31534r5423',
  })
  @IsString()
  id: string;

  constructor(
    message: string,
    receiverAddress: string,
    requestDeliveryReceipt: boolean = true,
    senderAddress: string,
    created: number,
    id: string,
  ) {
    this.message = message;
    this.receiverAddress = receiverAddress;
    this.requestDeliveryReceipt = requestDeliveryReceipt;
    this.senderAddress = senderAddress;
    this.created = created;
    this.id = id;
  }
}

export class OutgoingSmsPayloadDto {
  @ApiProperty({
    description: 'The message to send',
    example: 'A suitable message content',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'The phone numbers to receive the message',
    example: ['2348132461973'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  receiverAddress: string[];

  @ApiProperty({
    description: 'Service code for the SMS gateway',
    example: '10045',
  })
  @IsString()
  serviceCode: string;

  @ApiProperty({
    description: 'Whether to request a delivery receipt',
    example: false,
    default: false,
  })
  @IsBoolean()
  requestDeliveryReceipt: boolean;

  constructor(
    message: string,
    receiverAddress: string[],
    requestDeliveryReceipt: boolean = false,
  ) {
    this.message = message;
    this.receiverAddress = receiverAddress;
    this.requestDeliveryReceipt = requestDeliveryReceipt;
  }
}

export class SendSmsResponseDto {
  @ApiProperty({
    description: 'Whether the message was sent successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'The message sent',
    example: 'Message sent successfully',
  })
  message: string;
}
export class IcellDatasyncRequestDto {
  @ApiProperty({
    description: 'The service type',
    example: 'subscription',
  })
  serviceType: string;

  @ApiProperty({
    description: 'The result',
    example: 'Success',
  })
  result: string;
  @ApiProperty({
    description: 'The sequence number',
    example: '1234567890',
  })
  sequenceNo: string;
  @ApiProperty({
    description: 'The calling party: msisdn',
    example: '+2348060000000',
  })
  callingParty: string;
  @ApiProperty({
    description: 'The content id',
    example: '1234567890',
  })
  contentId: string;
  @ApiProperty({
    description: 'The result code',
    example: '0',
  })
  resultCode: string;
  @ApiProperty({
    description: 'The bearer id. SMS, USSD etc.',
    example: 'SMS',
  })
  bearerId: string;
  @ApiProperty({
    description: 'The operation id. SN, ACI, ES, YR, GR, SR, SAA, PN, RR',
    example: 'SN',
  })
  operationId: string;
  @ApiProperty({
    description: 'The service node',
    example: 'ICELL',
  })
  serviceNode: string;
  @ApiProperty({
    description: 'The service id',
    example: '234012000026427',
  })
  serviceId: string;
  @ApiProperty({
    description: 'The category',
    example: 'PISI_RELIGIOUS NOTIFICATION',
  })
  category: string;
  @ApiProperty({
    description: 'The processing time',
    example: '100',
  })
  processingTime: string;
  @ApiProperty({
    description: 'The charge amount',
    example: '100',
  })
  chargeAmount: string;
  @ApiProperty({
    description: 'The charging mode',
    example: 'SMS',
  })
  chargingMode: string;
  @ApiProperty({
    description: 'The requested plan',
    example: '23401220000031450',
  })
  requestedPlan: string;
  @ApiProperty({
    description: 'The applied plan',
    example: '1234567890',
  })
  appliedPlan: string;
  @ApiProperty({
    description: 'The validity type',
    example: 'days',
  })
  validityType: string;
  @ApiProperty({
    description: 'The validity days',
    example: '7',
  })
  validityDays: string;
  @ApiProperty({
    description: 'The renewal flag',
    example: 'Y',
  })
  renFlag: string;

  @ApiProperty({
    description: 'The keyword',
    example: 'STOP',
    required: false,
  })
  keyword: string;

  @ApiProperty({
    description: 'The request number',
    example: '1234567890',
    required: false,
  })
  requestNo: string;
}

// Marketers Dto
export class MarketersAnalyticsResponseDto {
  @ApiProperty({
    description: 'The name of the marketer',
    example: 'John Doe',
  })
  name: string;
  @ApiProperty({
    description: 'The total revenue of the marketer',
    example: 1000,
  })
  totalRevenue: number;
  @ApiProperty({
    description: 'The total number of customers',
    example: 1000,
  })
  totalCustomers: number;
  @ApiProperty({
    description: 'The total number of active customers',
    example: 1000,
  })
  totalActiveCustomers: number;
  @ApiProperty({
    description: 'The total number of monthly customers',
    example: 1000,
  })
  monthlyCustomers: number;
}

export class IcellProductResponseDto {
  @ApiProperty({
    description: 'The id of the product',
    example: '1234567890',
  })
  id: string;
  @ApiProperty({
    description: 'The name of the product',
    example: 'Product 1',
  })
  name: string;
  @ApiProperty({
    description: 'The price of the product',
    example: 100,
  })
  price: number;
  @ApiProperty({
    description: 'The currency of the product',
    example: 'NGN',
  })
  currency: string;
  @ApiProperty({
    description: 'The opt in keywords of the product',
    example: ['optIn1', 'optIn2'],
  })
  optInKeywords: string[];
  @ApiProperty({
    description: 'The opt out keywords of the product',
    example: ['optOut1', 'optOut2'],
  })
  optOutKeywords: string[];
  @ApiProperty({
    description: 'The validity days of the product',
    example: '7',
  })
  validityDays: string;
  @ApiProperty({
    description: 'The max access of the product',
    example: 100,
  })
  maxAccess: number | 'unlimited';
}
