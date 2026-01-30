import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  QUEUES,
  SUBSCRIPTION_SCHEDULED_JOBS,
} from 'src/common/constants/queues';
import { Logger } from '@nestjs/common';
import { SubscriptionService } from '../subscription.service';

type SubscriptionCronProcessorJobData = {
  payload: any;
};

@Processor(QUEUES.SUBSCRIPTION_SCHEDULED_JOBS)
export class SubscriptionCronProcessor extends WorkerHost {
  private readonly logger = new Logger(SubscriptionCronProcessor.name);
  constructor(private readonly subscriptionService: SubscriptionService) {
    super();
  }

  async process(job: Job<SubscriptionCronProcessorJobData>): Promise<any> {
    this.logger.log('Running subscription cron jobs...');
    try {
      switch (job.name) {
        case SUBSCRIPTION_SCHEDULED_JOBS.PROCESS_SUBSCRIPTION_EXPIRATIONS:
          const expiredSubscriptionsCount =
            await this.subscriptionService.processSubscriptionExpirations();
          this.logger.log(
            `Processed ${expiredSubscriptionsCount} subscription expirations`,
          );
          break;
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
          break;
      }
    } catch (error) {
      this.logger.error(
        `Error processing job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw to let BullMQ handle retries
    }
  }
}
