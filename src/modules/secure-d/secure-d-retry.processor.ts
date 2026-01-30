import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OperationType } from '@prisma/client';
import { SecureDRetryJobData } from 'src/common/types/subscription';

import { PrismaService } from 'src/common/services/database/prisma';
import { SubscriptionAuditProcessor } from '../subscription/audit/subscription-audit.processor';
import { SubscriptionContextBuilder } from '../subscription/audit/subscription-context.builder';
import { QUEUES, SECURE_D_RETRY_JOBS } from 'src/common/constants/queues';
import { SecureDDataSyncEntity } from 'src/shared/database/prisma/generated/secureDDataSync.entity';
import { PostbackService } from '../subscription/audit/postback.service';

@Processor(QUEUES.SECURE_D_RETRY)
export class SecureDRetryProcessor extends WorkerHost {
  private readonly logger = new Logger(SecureDRetryProcessor.name);

  constructor(
    private readonly subscriptionAuditProcessor: SubscriptionAuditProcessor,
    private readonly subscriptionContextBuilder: SubscriptionContextBuilder,
    private readonly prismaService: PrismaService,
    private readonly postbackService: PostbackService,
  ) {
    super();
  }

  async process(job: Job<{ payload: SecureDRetryJobData }>): Promise<void> {
    const { name } = job;
    const payload = job.data?.payload;

    const { auditRecordId, msisdn, productId, operationType, sequenceNo } =
      payload;

    if (name !== SECURE_D_RETRY_JOBS.PROCESS_SECURE_D_RETRY) {
      this.logger.warn(`Ignored job with unexpected name: ${name}`);
      return;
    }

    this.logger.log(
      `Processing SecureD retry ${job.attemptsMade + 1}/${job.opts.attempts} for audit record ${auditRecordId}`,
    );

    try {
      // Check if SecureD data is now available
      const secureDData = await this.findSecureDData(
        msisdn,
        productId,
        sequenceNo,
      );

      if (secureDData) {
        // SecureD data found, process with attribution
        await this.processWithSecureDAttribution(
          auditRecordId,
          secureDData,
          operationType,
        );
        this.logger.log(
          `Successfully processed SecureD attribution for audit record ${auditRecordId}`,
        );
        return;
      }

      if (!secureDData) {
        const attemptsMade = job.attemptsMade; // 0-based
        const maxAttempts = job.opts.attempts ?? 1;

        if (attemptsMade + 1 >= maxAttempts) {
          const failureComment =
            'SecureD data missing after 3 retries, processing incomplete';
          await this.subscriptionAuditProcessor.updateAuditRecordComment(
            auditRecordId,
            failureComment,
          );
          throw new Error('SecureD data not found (final attempt)');
        }

        // Trigger retry with fixed 5s backoff
        throw new Error('SecureD data not found, retrying');
      }

      // Retry not yet exhausted, will be retried automatically by BullMQ
      this.logger.log(
        `SecureD data not found for audit record ${auditRecordId}, will retry`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing SecureD retry for audit record ${auditRecordId}`,
        error.stack,
      );
      throw error;
    }
  }

  // Find SecureD data that corresponds to this datasync request
  private async findSecureDData(
    msisdn: string,
    productId: string,
    sequenceNo: string,
  ): Promise<SecureDDataSyncEntity> {
    try {
      const secureDData = await this.prismaService.secureDDataSync.findFirst({
        where: {
          msisdn,
          productId,
          trxId: sequenceNo,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return secureDData;
    } catch (error) {
      this.logger.error(
        `Failed to find SecureD data for ${msisdn}, with trxId: ${sequenceNo}`,
        error.stack,
      );
      return null;
    }
  }

  private async processWithSecureDAttribution(
    auditRecordId: string,
    secureDData: SecureDDataSyncEntity,
    operationType: OperationType,
  ): Promise<void> {
    try {
      // Resolve marketer from SecureD data
      const marketer =
        await this.subscriptionContextBuilder[
          'marketerHandler'
        ].resolveMarketer(secureDData);

      // Update audit record with SecureD attribution and get the updated record
      const updatedAuditRecord =
        await this.subscriptionAuditProcessor.updateAuditRecordWithSecureD(
          auditRecordId,
          marketer,
          secureDData,
        );

      // Determine acquisition status
      const businessLogicResult = await this.subscriptionContextBuilder[
        'businessLogicHandler'
      ].determineAcquisitionOrChurn(
        secureDData.msisdn,
        secureDData.trxId,
        operationType,
        marketer?.name,
      );

      const converted =
        secureDData.activation === '1' &&
        secureDData.description.toLowerCase() === 'success';

      await this.subscriptionAuditProcessor.updateAuditRecordBusinessIntelligenceFlags(
        updatedAuditRecord.id,
        businessLogicResult.isAcquisition,
        businessLogicResult.isChurned,
        converted,
      );

      // Check if postback should be processed using the updated record
      if (marketer && this.shouldProcessPostback(secureDData)) {
        await this.postbackService.processPostback(
          updatedAuditRecord,
          marketer,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process SecureD attribution for audit record ${auditRecordId}`,
        error.stack,
      );
      throw error;
    }
  }

  private shouldProcessPostback(secureDData: any): boolean {
    return (
      secureDData.activation === '1' &&
      secureDData.description.toLowerCase() === 'success'
    );
  }
}
