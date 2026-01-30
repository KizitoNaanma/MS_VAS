import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, TRAFFIC_MONITOR_JOBS } from 'src/common/constants/queues';
import { TrafficMonitorService } from './traffic-monitor.service';
import { TrafficData } from 'src/common';

@Processor(QUEUES.TRAFFIC_MONITOR)
export class TrafficMonitorProcessor extends WorkerHost {
  private readonly logger = new Logger(TrafficMonitorProcessor.name);

  constructor(private readonly trafficMonitorService: TrafficMonitorService) {
    super();
  }

  async process(job: Job<TrafficData>): Promise<any> {
    this.logger.log(`Processing job: ${job.name}`);

    switch (job.name) {
      case TRAFFIC_MONITOR_JOBS.SEND_TRAFFIC_REPORT:
        return this.trafficMonitorService.processTrafficReport();
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }
}
