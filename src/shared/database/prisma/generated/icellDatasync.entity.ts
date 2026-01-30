import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionAuditRecordEntity } from './subscriptionAuditRecord.entity';

export class IcellDatasyncEntity {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  id: number;
  @ApiProperty({
    type: 'string',
  })
  serviceType: string;
  @ApiProperty({
    type: 'string',
  })
  result: string;
  @ApiProperty({
    type: 'string',
  })
  sequenceNo: string;
  @ApiProperty({
    type: 'string',
  })
  callingParty: string;
  @ApiProperty({
    type: 'string',
  })
  contentId: string;
  @ApiProperty({
    type: 'string',
  })
  resultCode: string;
  @ApiProperty({
    type: 'string',
  })
  bearerId: string;
  @ApiProperty({
    type: 'string',
  })
  operationId: string;
  @ApiProperty({
    type: 'string',
  })
  serviceNode: string;
  @ApiProperty({
    type: 'string',
  })
  serviceId: string;
  @ApiProperty({
    type: 'string',
  })
  category: string;
  @ApiProperty({
    type: 'string',
  })
  processingTime: string;
  @ApiProperty({
    type: 'string',
  })
  chargeAmount: string;
  @ApiProperty({
    type: 'string',
  })
  chargingMode: string;
  @ApiProperty({
    type: 'string',
  })
  requestedPlan: string;
  @ApiProperty({
    type: 'string',
  })
  appliedPlan: string;
  @ApiProperty({
    type: 'string',
  })
  validityType: string;
  @ApiProperty({
    type: 'string',
  })
  validityDays: string;
  @ApiProperty({
    type: 'string',
  })
  renFlag: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  keyword: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  requestNo: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: () => SubscriptionAuditRecordEntity,
    required: false,
    nullable: true,
  })
  auditRecord?: SubscriptionAuditRecordEntity | null;
  @ApiProperty({
    type: 'boolean',
  })
  processed: boolean;
}
