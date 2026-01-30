import { Injectable, Logger } from '@nestjs/common';
import { OperationType, Prisma, PrismaClient } from '@prisma/client';
import { IcellDatasyncRequestDto } from 'src/common/dto/icell';
import { MarketerAttributionResolver } from './marketer-attribution.resolver';
import { AcquisitionChurnProcessor } from './acquisition-churn.processor';
import {
  ISubscriptionEventContext,
  SecureDRetryJobData,
} from 'src/common/types/subscription';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { SecureDDataSyncEntity } from 'src/shared/database/prisma/generated/secureDDataSync.entity';
import { PrismaService } from 'src/common/services/database/prisma';
import { SECURED_NAME } from 'src/common/constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES, SECURE_D_RETRY_JOBS } from 'src/common/constants/queues';

@Injectable()
export class SubscriptionContextBuilder {
  private readonly logger = new Logger(SubscriptionContextBuilder.name);

  constructor(
    private readonly marketerHandler: MarketerAttributionResolver,
    private readonly businessLogicHandler: AcquisitionChurnProcessor,
    private readonly prismaService: PrismaService,
    @InjectQueue(QUEUES.SECURE_D_RETRY) private secureDRetryQueue: Queue,
  ) {}

  // Builds the complete context for processing this event
  public async buildContext(
    datasync: IcellDatasyncRequestDto,
    operationType: OperationType,
    comment: string | null = null,
    tx?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >, // Optional transaction client
  ): Promise<ISubscriptionEventContext> {
    try {
      // Check if this is a SecureD request
      if (datasync.bearerId === SECURED_NAME) {
        return await this.buildSecureDContext(
          datasync,
          operationType,
          comment,
          tx,
        );
      } else {
        return await this.buildNonSecureDContext(
          datasync,
          operationType,
          comment,
          tx,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to build context for ${datasync.callingParty}`,
        error.stack,
      );
      throw error;
    }
  }

  // Builds context without calculating business logic (for use before audit record creation)
  public async buildContextWithoutBusinessLogic(
    datasync: IcellDatasyncRequestDto,
    operationType: OperationType,
    comment: string | null = null,
    tx?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >, // Optional transaction client
  ): Promise<ISubscriptionEventContext> {
    try {
      // Check if this is a SecureD request
      if (datasync.bearerId === SECURED_NAME) {
        return await this.buildSecureDContextWithoutBusinessLogic(
          datasync,
          operationType,
          comment,
          tx,
        );
      } else {
        return await this.buildNonSecureDContextWithoutBusinessLogic(
          datasync,
          operationType,
          comment,
          tx,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to build context without business logic for ${datasync.callingParty}`,
        error.stack,
      );
      throw error;
    }
  }

  // Build context for SecureD requests (with marketer attribution)
  private async buildSecureDContext(
    datasync: IcellDatasyncRequestDto,
    operationType: OperationType,
    comment: string | null = null,
    tx?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ): Promise<ISubscriptionEventContext> {
    // Try to find the corresponding SecureD data
    const secureDData = await this.findSecureDData(datasync, tx);

    if (!secureDData) {
      this.logger.warn(
        `No SecureD data found for datasync ${datasync.callingParty}, processing without marketer attribution`,
      );
      return await this.buildNonSecureDContext(
        datasync,
        operationType,
        comment,
        tx,
      );
    }

    // Resolve marketer from SecureD data
    const marketer = await this.marketerHandler.resolveMarketer(
      secureDData,
      tx,
    );

    // Determine acquisition and churn status
    const businessLogicResult =
      await this.businessLogicHandler.determineAcquisitionOrChurn(
        datasync.callingParty,
        datasync.sequenceNo,
        operationType,
        marketer?.name,
        tx,
      );

    const context: ISubscriptionEventContext = {
      operationType,
      marketer,
      isAcquisition: businessLogicResult.isAcquisition,
      isChurned: businessLogicResult.isChurned,
      comment,
    };

    this.logger.debug(
      `Built SecureD context for ${datasync.callingParty}: ${JSON.stringify({
        operationType: context.operationType,
        marketer: context.marketer,
        isAcquisition: context.isAcquisition,
        isChurned: context.isChurned,
      })}`,
    );

    return context;
  }

  // Build context for SecureD requests without business logic calculation
  private async buildSecureDContextWithoutBusinessLogic(
    datasync: IcellDatasyncRequestDto,
    operationType: OperationType,
    comment: string | null = null,
    tx?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ): Promise<ISubscriptionEventContext> {
    // Try to find the corresponding SecureD data
    const secureDData = await this.findSecureDData(datasync, tx);

    if (!secureDData) {
      this.logger.warn(
        `No SecureD data found for datasync ${datasync.callingParty}, processing without marketer attribution`,
      );
      return await this.buildNonSecureDContextWithoutBusinessLogic(
        datasync,
        operationType,
        comment,
        tx,
      );
    }

    // Resolve marketer from SecureD data
    const marketer = await this.marketerHandler.resolveMarketer(
      secureDData,
      tx,
    );

    const context: ISubscriptionEventContext = {
      operationType,
      marketer,
      isAcquisition: false,
      isChurned: false,
      comment,
    };

    this.logger.debug(
      `Built SecureD context  ${datasync.callingParty} - ${context.operationType} - Marketer: ${context.marketer.name}`,
    );

    return context;
  }

  // Build context for non-SecureD requests (no marketer attribution)
  private async buildNonSecureDContext(
    datasync: IcellDatasyncRequestDto,
    operationType: OperationType,
    comment: string | null = null,
    tx?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ): Promise<ISubscriptionEventContext> {
    // Only determine churn status (no acquisition logic for non-SecureD)
    const businessLogicResult =
      await this.businessLogicHandler.determineAcquisitionOrChurn(
        datasync.callingParty,
        datasync.sequenceNo,
        operationType,
        undefined, // No marketer for non-SecureD requests
        tx,
      );

    const context: ISubscriptionEventContext = {
      operationType,
      marketer: null, // No marketer involved
      isAcquisition: false, // No marketer-driven acquisition
      isChurned: businessLogicResult.isChurned,
      comment: comment || `Direct subscription event via ${datasync.bearerId}`,
    };

    this.logger.debug(
      `Built non-SecureD context for ${datasync.callingParty}: ${JSON.stringify(
        {
          operationType: context.operationType,
          marketer: context.marketer,
          isAcquisition: context.isAcquisition,
          isChurned: context.isChurned,
        },
      )}`,
    );

    return context;
  }

  // Build context for non-SecureD requests without business logic calculation
  private async buildNonSecureDContextWithoutBusinessLogic(
    datasync: IcellDatasyncRequestDto,
    operationType: OperationType,
    comment: string | null = null,
    _tx?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ): Promise<ISubscriptionEventContext> {
    const context: ISubscriptionEventContext = {
      operationType,
      marketer: null, // No marketer involved
      isAcquisition: false, // Placeholder - will be calculated after audit record creation
      isChurned: false, // Placeholder - will be calculated after audit record creation
      comment: comment || `Direct subscription event via ${datasync.bearerId}`,
    };

    this.logger.debug(
      `Built non-SecureD context without business logic for ${datasync.callingParty}: ${JSON.stringify(
        {
          operationType: context.operationType,
          marketer: context.marketer,
        },
      )}`,
    );

    return context;
  }

  // Find SecureD data that corresponds to this datasync request
  private async findSecureDData(
    datasync: IcellDatasyncRequestDto,
    tx?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ): Promise<SecureDDataSyncEntity | null> {
    const dbClient = tx || this.prismaService;

    try {
      const productId = datasync.requestedPlan.split('_')[0];

      // Use trxId to find SecureD data (trxId = sequenceNo)
      const secureDData = await dbClient.secureDDataSync.findFirst({
        where: {
          trxId: datasync.sequenceNo, // Direct correlation
          msisdn: datasync.callingParty,
          productId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return secureDData;
    } catch (error) {
      this.logger.error(
        `Failed to find SecureD data for sequenceNo ${datasync.sequenceNo}`,
        error.stack,
      );
      return null;
    }
  }

  // Queue SecureD retry job for later processing
  public async queueSecureDRetry(
    auditRecordId: string,
    productId: string,
    msisdn: string,
    sequenceNo: string,
    operationType: OperationType,
    originalComment?: string,
  ): Promise<void> {
    try {
      const retryJobData: SecureDRetryJobData = {
        auditRecordId,
        productId,
        msisdn,
        sequenceNo,
        operationType,
        originalComment,
      };

      await this.secureDRetryQueue.add(
        SECURE_D_RETRY_JOBS.PROCESS_SECURE_D_RETRY,
        { payload: retryJobData },
        {
          attempts: 3,
          backoff: { type: 'fixed', delay: 5000 },
          delay: 5000,
          removeOnComplete: true,
          removeOnFail: 50,
        },
      );

      this.logger.log(
        `Queued SecureD retry job for audit record ${auditRecordId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue SecureD retry job for ${msisdn}`,
        error.stack,
      );
      throw error;
    }
  }
}
