import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionAuditRecordEntity } from './subscriptionAuditRecord.entity';

export class SecureDDataSyncEntity {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  id: number;
  @ApiProperty({
    type: 'string',
  })
  msisdn: string;
  @ApiProperty({
    type: 'string',
  })
  activation: string;
  @ApiProperty({
    type: 'string',
  })
  productId: string;
  @ApiProperty({
    type: 'string',
  })
  description: string;
  @ApiProperty({
    type: 'string',
  })
  timestamp: string;
  @ApiProperty({
    type: 'string',
  })
  trxId: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: () => SubscriptionAuditRecordEntity,
    isArray: true,
    required: false,
  })
  auditRecords?: SubscriptionAuditRecordEntity[];
}
