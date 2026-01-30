import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  QUEUES,
  SUBSCRIPTION_SCHEDULED_JOBS,
} from 'src/common/constants/queues';

@Injectable()
export class SubscriptionCronService implements OnModuleInit {
  constructor(
    @InjectQueue(QUEUES.SUBSCRIPTION_SCHEDULED_JOBS)
    private subscriptionQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.setupCronJob(
      this.subscriptionQueue,
      SUBSCRIPTION_SCHEDULED_JOBS.PROCESS_SUBSCRIPTION_EXPIRATIONS,
      '0 0 * * *', // Runs at midnight (00:00) every day
    );
  }

  private async setupCronJob(queue: Queue, jobName: string, pattern: string) {
    // remove all old instances
    const repeatableJobs = await queue.getJobSchedulers();

    for (const job of repeatableJobs) {
      if (job.name === jobName) {
        await queue.removeJobScheduler(job.key);
      }
    }

    await queue.add(jobName, undefined, {
      repeat: {
        pattern: pattern,
        tz: 'Africa/Lagos',
      },
      removeOnComplete: true,
      removeOnFail: 10, // Keep last 10 failed jobs for debugging
    });
  }
}
