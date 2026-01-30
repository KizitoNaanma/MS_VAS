import { Prisma, OperationType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionAuditRecordDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  msisdn: string;
  @ApiProperty({
    enum: OperationType,
  })
  operationType: OperationType;
  @ApiProperty({
    type: 'string',
  })
  serviceId: string;
  @ApiProperty({
    type: 'string',
  })
  productId: string;
  @ApiProperty({
    type: 'number',
    format: 'double',
    nullable: true,
  })
  amountCharged: Prisma.Decimal | null;
  @ApiProperty({
    type: 'string',
  })
  source: string;
  @ApiProperty({
    type: 'boolean',
  })
  acquired: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  churned: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  converted: boolean;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  comment: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  processedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}
