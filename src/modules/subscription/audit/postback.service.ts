import { Injectable, Logger } from '@nestjs/common';
import { IHttpService } from 'src/common';
import { MarketerEntity } from 'src/shared/database/prisma/generated/marketer.entity';
import { SubscriptionAuditRecordEntity } from 'src/shared/database/prisma/generated/subscriptionAuditRecord.entity';
import { PrismaService } from 'src/common/services/database/prisma';

@Injectable()
export class PostbackService {
  private readonly logger = new Logger(PostbackService.name);

  constructor(
    private readonly httpService: IHttpService,
    private readonly prismaService: PrismaService,
  ) {}

  async processPostback(
    auditRecord: SubscriptionAuditRecordEntity,
    marketer: Partial<MarketerEntity>,
  ): Promise<void> {
    try {
      this.logger.log(
        `Processing postback for conversion: ${auditRecord.msisdn}`,
      );

      // Extract click_id and source_id from trxId
      const secureDData = auditRecord.securedDataSync;
      if (!secureDData?.trxId) {
        this.logger.warn('No trxId found for postback processing');
        return;
      }

      const { clickId, sourceId } = this.extractClickAndSourceId(
        secureDData.trxId,
        marketer.prefix,
      );

      // Make postback request
      const postbackSuccess = await this.makePostbackRequest({
        postbackUrl: marketer.postbackUrl,
        clickId,
        payout: marketer.payout,
        sourceId,
      });

      // Update audit record with postback result
      await this.prismaService.subscriptionAuditRecord.update({
        where: { id: auditRecord.id },
        data: {
          comment: `${auditRecord.comment || ''} | Postback: ${postbackSuccess ? 'Success' : 'Failed'}`,
        },
      });

      this.logger.log(
        `Postback ${postbackSuccess ? 'successful' : 'failed'} for ${auditRecord.msisdn}`,
      );
    } catch (error) {
      this.logger.error('Error processing postback', error);
    }
  }

  private extractClickAndSourceId(trxId: string, marketerPrefix: string) {
    let clickId = '';
    let sourceId = '';

    if (trxId.includes(marketerPrefix)) {
      const splitByPrefix = trxId.split(marketerPrefix + '-');
      if (splitByPrefix.length > 1) {
        const ids = splitByPrefix[1].split('-');
        clickId = ids[0] || '';
        if (ids.length > 1) {
          sourceId = ids[1] || '';
        }
      }
    } else {
      const parts = trxId.split('-');
      clickId = parts[1] || '';
      sourceId = parts[2] || '';
    }

    return { clickId, sourceId };
  }

  private async makePostbackRequest({
    postbackUrl,
    clickId,
    payout,
    sourceId,
  }: {
    postbackUrl: string;
    clickId: string;
    payout: string;
    sourceId: string;
  }): Promise<boolean> {
    try {
      if (!postbackUrl) {
        this.logger.warn('No postback URL provided');
        return false;
      }

      // Build postback URL with parameters
      const url = new URL(postbackUrl);
      url.searchParams.set('click_id', clickId);
      url.searchParams.set('payout', payout);
      url.searchParams.set('source_id', sourceId);

      const response = await this.httpService.get(url.toString(), {
        method: 'GET',
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // return response.status === 200;
      if (response) {
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Postback request failed', error);
      return false;
    }
  }
}
