import { Prisma, OperationType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { MarketerEntity } from './marketer.entity';
import { SecureDDataSyncEntity } from './secureDDataSync.entity';
import { IcellDatasyncEntity } from './icellDatasync.entity';

export class SubscriptionAuditRecordEntity {
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
    nullable: true,
  })
  userId: string | null;
  @ApiProperty({
    type: () => UserEntity,
    required: false,
    nullable: true,
  })
  user?: UserEntity | null;
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
    type: () => MarketerEntity,
    required: false,
    nullable: true,
  })
  marketer?: MarketerEntity | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  marketerId: string | null;
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
    type: () => SecureDDataSyncEntity,
    required: false,
    nullable: true,
  })
  securedDataSync?: SecureDDataSyncEntity | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  securedDataSyncId: number | null;
  @ApiProperty({
    type: () => IcellDatasyncEntity,
    required: false,
  })
  icellDataSync?: IcellDatasyncEntity;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  icellDataSyncId: number;
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
