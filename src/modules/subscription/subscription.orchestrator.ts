import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IcellDatasyncRequestDto } from 'src/common/dto/icell';
import { SubscriptionService } from './subscription.service';
import { SubscriptionAuditProcessor } from './audit/subscription-audit.processor';

@Injectable()
export class SubscriptionOrchestrator {
  private readonly logger = new Logger(SubscriptionOrchestrator.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionEventHandler: SubscriptionAuditProcessor,
  ) {}

  @OnEvent('subscription.process')
  async handleSubscriptionProcess(
    request: IcellDatasyncRequestDto,
  ): Promise<void> {
    try {
      // Process business logic first
      await this.subscriptionService.processUserSubscription(request);

      // Then create audit record
      await this.subscriptionEventHandler.processSubscriptionEvent(
        request,
        'Subscription Processing Complete',
      );

      this.logger.log(
        `Subscription processed and audited for user: ${request.callingParty}`,
      );
    } catch (error) {
      this.logger.error('Error handling subscription process event', error);
      throw error;
    }
  }

  @OnEvent('subscription.renewal')
  async handleSubscriptionRenewal(
    request: IcellDatasyncRequestDto,
  ): Promise<void> {
    try {
      // Process business logic first
      await this.subscriptionService.processUserRenewal(request);

      // Then create audit record
      await this.subscriptionEventHandler.processSubscriptionEvent(
        request,
        'Renewal Processing Complete',
      );

      this.logger.log(
        `Subscription renewal processed and audited for user: ${request.callingParty}`,
      );
    } catch (error) {
      this.logger.error('Error handling subscription renewal event', error);
      throw error;
    }
  }

  @OnEvent('subscription.unsubscription')
  async handleSubscriptionUnsubscription(
    request: IcellDatasyncRequestDto,
  ): Promise<void> {
    try {
      // Process business logic first
      await this.subscriptionService.processUserUnsubscription(request);

      // Then create audit record
      await this.subscriptionEventHandler.processSubscriptionEvent(
        request,
        'Unsubscription Processing Complete',
      );

      this.logger.log(
        `Unsubscription processed and audited for user: ${request.callingParty}`,
      );
    } catch (error) {
      this.logger.error('Error handling unsubscription event', error);
      throw error;
    }
  }

  @OnEvent('subscription.audit')
  async handleGenericSubscriptionAudit(
    request: IcellDatasyncRequestDto,
  ): Promise<void> {
    try {
      // Only audit - no business logic for unmatched operations
      await this.subscriptionEventHandler.processSubscriptionEvent(
        request,
        'Unknown Operation Type - Audit Only',
      );

      this.logger.log(
        `Generic subscription audit handled for user: ${request.callingParty}`,
      );
    } catch (error) {
      this.logger.error(
        'Error handling generic subscription audit event',
        error,
      );
      throw error;
    }
  }
}
