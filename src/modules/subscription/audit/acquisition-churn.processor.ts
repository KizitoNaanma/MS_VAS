import { Injectable, Logger } from '@nestjs/common';
import { OperationType, Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { SECURED_NAME } from 'src/common/constants';
import { PrismaService } from 'src/common/services/database/prisma';

export interface BusinessLogicResult {
  isAcquisition: boolean;
  isChurned: boolean;
}

@Injectable()
export class AcquisitionChurnProcessor {
  private readonly logger = new Logger(AcquisitionChurnProcessor.name);

  constructor(private readonly prismaService: PrismaService) {}

  // Determines if this is a new customer acquisition
  private async isAcquisition(
    msisdn: string,
    sequenceNo: string,
    operationType: OperationType,
    marketerName: string | undefined,
    dbClient: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ): Promise<boolean> {
    if (
      operationType !== OperationType.SUBSCRIPTION.toString() ||
      !marketerName
    ) {
      return false;
    }

    try {
      const mostRecentSubscription =
        await dbClient.subscriptionAuditRecord.findFirst({
          where: {
            msisdn: msisdn,
            operationType: OperationType.SUBSCRIPTION,
            icellDataSync: {
              bearerId: SECURED_NAME,
              sequenceNo,
            },
            securedDataSync: {
              trxId: sequenceNo,
            },
          },
          include: {
            marketer: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

      if (mostRecentSubscription) {
        this.logger.log(
          `New customer acquisition detected for ${msisdn} via marketer ${marketerName}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Failed to determine acquisition status for ${msisdn}`,
        error.stack,
      );
      throw error;
    }
  }

  // Determines if this represents customer churn (unsubscription)
  private async isChurned(operationType: OperationType): Promise<boolean> {
    return operationType === OperationType.UNSUBSCRIPTION.toString();
  }

  // Determines if this subscription event represents acquisition or churn
  public async determineAcquisitionOrChurn(
    msisdn: string,
    sequenceNo: string,
    operationType: OperationType,
    marketerName: string | undefined,
    tx?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >, // Optional transaction client
  ): Promise<BusinessLogicResult> {
    const dbClient = tx || this.prismaService;

    try {
      const isAcquisition = await this.isAcquisition(
        msisdn,
        sequenceNo,
        operationType,
        marketerName,
        dbClient,
      );

      const isChurned = await this.isChurned(operationType);

      return {
        isAcquisition,
        isChurned,
      };
    } catch (error) {
      this.logger.error(
        `Failed to determine acquisition/churn for ${msisdn}`,
        error.stack,
      );
      throw error;
    }
  }
}
