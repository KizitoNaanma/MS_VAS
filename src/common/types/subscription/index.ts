import { OperationType } from '@prisma/client';
import { MarketerEntity } from 'src/shared/database/prisma/generated/marketer.entity';

export interface ISubscriptionEventContext {
  operationType: OperationType;
  marketer: Partial<MarketerEntity> | null;
  isAcquisition: boolean;
  isChurned: boolean;
  comment: string | null;
}

export interface SecureDRetryJobData {
  auditRecordId: string;
  productId: string;
  msisdn: string;
  sequenceNo: string;
  operationType: OperationType;
  originalComment?: string;
}
