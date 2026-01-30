import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionAuditRecordEntity } from './subscriptionAuditRecord.entity';

export class MarketerEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  prefix: string;
  @ApiProperty({
    type: 'boolean',
  })
  isActive: boolean;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  postbackUrl: string | null;
  @ApiProperty({
    type: 'string',
  })
  payout: string;
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
  @ApiProperty({
    type: () => SubscriptionAuditRecordEntity,
    isArray: true,
    required: false,
  })
  auditRecords?: SubscriptionAuditRecordEntity[];
}
