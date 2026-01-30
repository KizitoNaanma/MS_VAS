import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/common/services/database/prisma';
import { IcellDatasyncRequestDto } from 'src/common/dto/icell';
import { IcellDatasyncHandler } from 'src/shared/icell-core/handlers/icell-datasync.handler';
import {
  OperationType,
  Prisma,
  PrismaClient,
  SubscriptionAuditRecord,
} from '@prisma/client';
import { ISubscriptionEventContext } from 'src/common/types/subscription';
import { SubscriptionContextBuilder } from './subscription-context.builder';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { UserService } from 'src/modules/user/user.service';
import { SecureDDataSyncEntity } from 'src/shared/database/prisma/generated/secureDDataSync.entity';
import { SECURED_NAME } from 'src/common/constants';
import { PostbackService } from './postback.service';
import { SubscriptionAuditRecordEntity } from 'src/shared/database/prisma/generated/subscriptionAuditRecord.entity';

interface SubscriptionProcessingResult {
  success: boolean;
  auditRecord?: SubscriptionAuditRecord;
  error?: Error;
  datasyncId?: number;
}

class SubscriptionProcessingError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
    public readonly datasync?: IcellDatasyncRequestDto,
  ) {
    super(message);
    this.name = 'SubscriptionProcessingError';
  }
}

@Injectable()
export class SubscriptionAuditProcessor {
  private readonly logger = new Logger(SubscriptionAuditProcessor.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly icellDatasyncHandler: IcellDatasyncHandler,
    private readonly subscriptionEventContext: SubscriptionContextBuilder,
    private readonly userService: UserService,
    private readonly postbackService: PostbackService,
  ) {}

  private async buildSubscriptionComment(
    operationType: OperationType,
    baseComment?: string,
    marketerName?: string,
  ): Promise<string | undefined> {
    const comments = [];

    if (baseComment) {
      comments.push(baseComment);
    }

    if (
      !marketerName &&
      [
        OperationType.SUBSCRIPTION.toString(),
        OperationType.UNSUBSCRIPTION.toString(),
      ].includes(operationType)
    ) {
      comments.push('No Marketer Attribution');
    }

    if (comments.length > 0) {
      return comments.join(' | ');
    }
    return undefined;
  }

  private async findMatchingSecureDNotification(
    msisdn: string,
    productId: string,
    sequenceNo: string,
  ): Promise<Partial<SecureDDataSyncEntity> | null> {
    try {
      const secureDData = await this.prismaService.secureDDataSync.findFirst({
        where: {
          msisdn,
          productId,
          trxId: sequenceNo,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          activation: true,
          description: true,
        },
      });
      return secureDData;
    } catch (error) {
      this.logger.error(
        `Failed to find SecureD data for ${msisdn}`,
        error.stack,
      );
      return null;
    }
  }

  private async createSubscriptionAuditRecord(
    datasync: IcellDatasyncRequestDto,
    context: ISubscriptionEventContext,
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >, // Prisma transaction client
  ) {
    // Handle Datasync converter data if bearerId is "SecureD"
    let secureDData: Partial<SecureDDataSyncEntity> | null = null;
    let converted = false;

    // Purify product id from possible underscores
    const productId = datasync.requestedPlan.split('_')[0];

    if (datasync.bearerId === SECURED_NAME) {
      secureDData = await this.findMatchingSecureDNotification(
        datasync.callingParty,
        productId,
        datasync.sequenceNo,
      );

      if (secureDData) {
        // Calculate converted based on SecureD notification data
        converted =
          secureDData.activation === '1' &&
          secureDData.description.toLowerCase() === 'success';

        this.logger.log(
          `Found matching SecureD data for ${datasync.callingParty}, converted: ${converted}`,
        );
      }
    }

    const userResult = await this.userService.findOrCreateUserByPhone(
      datasync.callingParty,
      { operation: 'get-only' },
    );

    if (!userResult) {
      this.logger.warn(
        `User not found for phone: ${datasync.callingParty}. Operation type: ${context.operationType}. Skipping audit record creation.`,
      );
      return;
    }

    const { user } = userResult;

    const datasyncRecord = await tx.icellDatasync.findFirst({
      // find exact existing datasync record
      where: {
        sequenceNo: datasync.sequenceNo,
        serviceId: datasync.serviceId,
        requestedPlan: datasync.requestedPlan,
        processingTime: datasync.processingTime,
        bearerId: datasync.bearerId,
        callingParty: datasync.callingParty,
      },
      select: {
        id: true,
      },
    });

    const auditRecord = await tx.subscriptionAuditRecord.create({
      data: {
        msisdn: datasync.callingParty,
        operationType: context.operationType,
        comment: context.comment,
        ...(context.marketer?.id && {
          marketer: {
            connect: { id: context.marketer.id },
          },
        }),
        serviceId: datasync.serviceId,
        productId: datasync.requestedPlan,
        source: datasync.bearerId,
        acquired: false, // Placeholder - will be updated after business logic
        churned: false, // Placeholder - will be updated after business logic
        converted,
        amountCharged: datasync.chargeAmount,
        icellDataSync: {
          connect: {
            id: datasyncRecord.id,
          },
        },
        user: {
          connect: { id: user.id },
        },
        // Link to SecureD record if found
        ...(secureDData && {
          securedDataSync: {
            connect: { id: secureDData.id },
          },
        }),
        createdAt: new Date(),
      },
      include: {
        marketer: true,
        icellDataSync: true,
        securedDataSync: true,
      },
    });

    return auditRecord;
  }

  private async markDatasyncAsProcessed(
    datasync: IcellDatasyncRequestDto,
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >, // Prisma transaction client
  ): Promise<void> {
    const updatedDatasync = await tx.icellDatasync.findFirst({
      // find exact existing datasync record
      where: {
        sequenceNo: datasync.sequenceNo,
        callingParty: datasync.callingParty,
        requestedPlan: datasync.requestedPlan,
        serviceId: datasync.serviceId,
        processingTime: datasync.processingTime,
        bearerId: datasync.bearerId,
      },
    });

    if (updatedDatasync) {
      await tx.icellDatasync.update({
        where: { id: updatedDatasync.id },
        data: { processed: true },
      });
    }
  }

  private validateDatasync(datasync: IcellDatasyncRequestDto): void {
    if (!datasync.callingParty) {
      throw new SubscriptionProcessingError(
        'Missing required field: callingParty',
        undefined,
        datasync,
      );
    }
    if (!datasync.serviceId) {
      throw new SubscriptionProcessingError(
        'Missing required field: serviceId',
        undefined,
        datasync,
      );
    }
    if (!datasync.operationId) {
      throw new SubscriptionProcessingError(
        'Missing required field: operationId',
        undefined,
        datasync,
      );
    }
  }

  /**
   * Main entry point for processing subscription events.
   * Returns success status for orchestrator handling.
   */
  async processSubscriptionEvent(
    datasync: IcellDatasyncRequestDto,
    comment?: string,
  ): Promise<SubscriptionProcessingResult | undefined> {
    try {
      // Validate input
      this.validateDatasync(datasync);

      this.logger.log(
        `Processing subscription event for ${datasync.callingParty} - Operation: ${datasync.operationId}`,
      );

      // Use transaction to ensure data consistency
      const { auditRecord, operationType, marketerName } =
        await this.prismaService.$transaction(async (tx) => {
          // Determine the operation type
          const operationType =
            this.icellDatasyncHandler.determineDatasyncOperationType(
              datasync.operationId,
            );

          // Build the context for this event (without business intelligence logic calculation)
          const context =
            await this.subscriptionEventContext.buildContextWithoutBusinessLogic(
              datasync,
              operationType,
              comment,
              tx,
            );

          // For SecureD requests without SecureD data, queue for retry
          if (datasync.bearerId === SECURED_NAME && !context.marketer) {
            // Update comment to indicate processing status
            context.comment = 'Processing SecureD attribution -';
          }

          // Build the final comment for the event
          const finalComment = await this.buildSubscriptionComment(
            operationType,
            context.comment,
            context.marketer?.name,
          );

          // Update context with final comment
          context.comment = finalComment;

          // Create the subscription audit record
          const auditRecord = await this.createSubscriptionAuditRecord(
            datasync,
            context,
            tx,
          );

          // Queue retry job for SecureD requests without marketer attribution
          if (datasync.bearerId === SECURED_NAME && !context.marketer) {
            const productId = datasync.requestedPlan.split('_')[0];
            await this.subscriptionEventContext.queueSecureDRetry(
              auditRecord.id,
              productId,
              datasync.callingParty,
              datasync.sequenceNo,
              operationType,
              finalComment,
            );
          }

          // Mark datasync as processed
          await this.markDatasyncAsProcessed(datasync, tx);

          return {
            auditRecord,
            operationType,
            marketerName: context.marketer?.name,
          };
        });

      // If no audit record was created (e.g. user not found), exit early
      if (!auditRecord) {
        return undefined;
      }

      // calculate business intelligence flags
      const businessLogicResult = await this.subscriptionEventContext[
        'businessLogicHandler'
      ].determineAcquisitionOrChurn(
        datasync.callingParty,
        datasync.sequenceNo,
        operationType,
        marketerName,
      );

      // Update the audit record with correct business intelligence flags
      await this.updateAuditRecordBusinessIntelligenceFlags(
        auditRecord.id,
        businessLogicResult.isAcquisition,
        businessLogicResult.isChurned,
        auditRecord.converted,
      );

      // Get the updated audit record with all relationships
      const finalAuditRecord =
        await this.prismaService.subscriptionAuditRecord.findUnique({
          where: { id: auditRecord.id },
          include: {
            marketer: true,
            icellDataSync: true,
            securedDataSync: true,
          },
        });

      // Process postback for SecureD conversions AFTER transaction commits
      if (
        datasync.bearerId === SECURED_NAME &&
        finalAuditRecord.converted &&
        finalAuditRecord.marketer
      ) {
        await this.postbackService.processPostback(
          finalAuditRecord,
          finalAuditRecord.marketer,
        );
      }

      this.logger.log(
        `Successfully processed subscription audit for ${datasync.callingParty} - Audit ID: ${finalAuditRecord.id}`,
      );

      return {
        success: true,
        auditRecord: finalAuditRecord,
        datasyncId: finalAuditRecord.icellDataSync.id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process subscription event for ${datasync.callingParty}`,
        error.stack,
      );

      if (error instanceof SubscriptionProcessingError) {
        return {
          success: false,
          error,
        };
      }

      const processingError = new SubscriptionProcessingError(
        `Unexpected error processing subscription event: ${error.message}`,
        error,
        datasync,
      );

      return {
        success: false,
        error: processingError,
      };
    }
  }

  // Update audit record with SecureD attribution results
  public async updateAuditRecordWithSecureD(
    auditRecordId: string,
    marketer: any,
    secureDData: SecureDDataSyncEntity,
  ): Promise<SubscriptionAuditRecordEntity> {
    try {
      const updatedComment = `Subscription Processing Complete - SecureD attribution completed`;

      const updatedRecord =
        await this.prismaService.subscriptionAuditRecord.update({
          where: { id: auditRecordId },
          data: {
            marketerId: marketer?.id,
            comment: updatedComment,
            securedDataSyncId: secureDData.id,
          },
          include: {
            marketer: true,
            icellDataSync: true,
            securedDataSync: true,
          },
        });

      this.logger.log(
        `Updated audit record ${auditRecordId} with SecureD attribution`,
      );

      return updatedRecord;
    } catch (error) {
      this.logger.error(
        `Failed to update audit record ${auditRecordId} with SecureD attribution`,
        error.stack,
      );
      throw error;
    }
  }

  // Update audit record comment for failed retries
  public async updateAuditRecordComment(
    auditRecordId: string,
    comment: string,
  ): Promise<void> {
    try {
      await this.prismaService.subscriptionAuditRecord.update({
        where: { id: auditRecordId },
        data: { comment },
      });

      this.logger.log(`Updated audit record ${auditRecordId} comment`);
    } catch (error) {
      this.logger.error(
        `Failed to update audit record ${auditRecordId} comment`,
        error.stack,
      );
      throw error;
    }
  }

  // Update audit record comment for failed retries
  public async updateAuditRecordBusinessIntelligenceFlags(
    auditRecordId: string,
    isAcquisition: boolean,
    isChurned: boolean,
    isConverted: boolean,
  ): Promise<void> {
    try {
      await this.prismaService.subscriptionAuditRecord.update({
        where: { id: auditRecordId },
        data: {
          acquired: isAcquisition,
          churned: isChurned,
          converted: isConverted,
        },
      });

      this.logger.log(
        `Updated audit record ${auditRecordId} business intelligence flags`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update audit record ${auditRecordId} business intelligence flags`,
        error.stack,
      );
      throw error;
    }
  }
}
