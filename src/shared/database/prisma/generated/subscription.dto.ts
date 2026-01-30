import { Prisma, OperationType, SubscriptionStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  userPhoneNumber: string;
  @ApiProperty({
    type: 'string',
  })
  productId: string;
  @ApiProperty({
    type: 'string',
  })
  productName: string;
  @ApiProperty({
    type: 'string',
  })
  serviceId: string;
  @ApiProperty({
    type: 'string',
  })
  serviceName: string;
  @ApiProperty({
    type: 'string',
  })
  serviceType: string;
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  amount: Prisma.Decimal;
  @ApiProperty({
    enum: OperationType,
  })
  operationType: OperationType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  txnRef: string | null;
  @ApiProperty({
    type: 'string',
  })
  sequenceNo: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  startDate: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  endDate: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  maxAccess: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  accessCount: number;
  @ApiProperty({
    enum: SubscriptionStatus,
  })
  status: SubscriptionStatus;
  @ApiProperty({
    type: 'string',
  })
  mobileNetworkOperator: string;
  @ApiProperty({
    type: 'string',
  })
  aggregator: string;
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
