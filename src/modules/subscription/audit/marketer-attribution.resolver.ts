import { Injectable, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

import { PrismaService } from 'src/common/services/database/prisma';
import { MarketerEntity } from 'src/shared/database/prisma/generated/marketer.entity';
import { SecureDDataSyncEntity } from 'src/shared/database/prisma/generated/secureDDataSync.entity';

@Injectable()
export class MarketerAttributionResolver {
  private readonly logger = new Logger(MarketerAttributionResolver.name);
  constructor(private readonly prismaService: PrismaService) {}

  private getMarketerPrefix(secureDData: SecureDDataSyncEntity): string {
    // Example: "PREFIX-CLICKID-SOURCEID"
    const prefix = secureDData.trxId.split('-')[0];
    return prefix;
  }

  // Resolves to marketer's entity from prefix
  public async resolveMarketer(
    secureDData: SecureDDataSyncEntity,
    tx?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >, // Optional transaction client
  ): Promise<Partial<MarketerEntity> | null> {
    const prefix = this.getMarketerPrefix(secureDData);
    const marketer = await this.getMarketer(prefix, tx);
    return marketer;
  }

  // Gets a marketer entity - ensures consistency
  private async getMarketer(
    prefix: string,
    tx?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >, // Optional transaction client
  ): Promise<Partial<MarketerEntity> | null> {
    if (!prefix) {
      this.logger.warn(`No marketer name provided for prefix: ${prefix}`);
      return null;
    }

    const dbClient = tx || this.prismaService;

    try {
      // Try to find existing marketer
      const marketer = await dbClient.marketer.findFirst({
        where: {
          prefix: prefix,
        },
        select: {
          id: true,
          name: true,
          prefix: true,
          payout: true,
          postbackUrl: true,
        },
      });

      return marketer;
    } catch (error) {
      this.logger.error(
        `Failed to get marketer with prefix: ${prefix}`,
        error.stack,
      );
      throw error;
    }
  }
}
