import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUES, TRAFFIC_MONITOR_JOBS } from 'src/common/constants/queues';
import { env } from 'src/common/env';
import { WebhookNotificationService } from './webhook-notification.service';
import { TrafficTrackerService } from './traffic-tracker.service';

@Injectable()
export class TrafficMonitorService implements OnModuleInit {
  private readonly TRAFFIC_NOTIFICATION_URL =
    'https://discord.com/api/webhooks/1415403118094450870/SZXFgYMwA5FMG_8YNW1wvoqhjG2m3DidKoJlzxZoS6DNu9pNJ5x1lj-DukviB2HwaXC7';

  constructor(
    private readonly webhookNotificationService: WebhookNotificationService,
    private readonly trafficTrackerService: TrafficTrackerService,
    @InjectQueue(QUEUES.TRAFFIC_MONITOR)
    private trafficMonitorQueue: Queue,
  ) {}

  async onModuleInit() {
    // Only set up cron job in non-dev environments
    if (env.isProd) {
      await this.setupTrafficReportCronJob();
    }
  }

  private async setupTrafficReportCronJob() {
    // Remove all old instances
    const repeatableJobs = await this.trafficMonitorQueue.getJobSchedulers();

    for (const job of repeatableJobs) {
      if (job.name === TRAFFIC_MONITOR_JOBS.SEND_TRAFFIC_REPORT) {
        await this.trafficMonitorQueue.removeJobScheduler(job.key);
      }
    }

    // Add new cron job that runs every 30 minutes
    await this.trafficMonitorQueue.add(
      TRAFFIC_MONITOR_JOBS.SEND_TRAFFIC_REPORT,
      {},
      {
        jobId: 'traffic-report-cron',
        repeat: {
          pattern: '0 */3 * * *', // Every 3 hours
          tz: 'Africa/Lagos',
        },
        removeOnComplete: true,
        removeOnFail: 10, // Keep last 10 failed jobs for debugging
      },
    );
  }

  async processTrafficReport(): Promise<void> {
    try {
      const trafficData = await this.trafficTrackerService.getTrafficData();

      await this.webhookNotificationService.sendTrafficNotifications(
        this.TRAFFIC_NOTIFICATION_URL,
        {
          ...trafficData,
          environment: env.env,
        },
      );
    } catch (error) {
      console.error('Failed to process traffic report:', error);
    }
  }
}
