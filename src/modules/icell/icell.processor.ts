import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ICELL_PROCESSOR_JOBS, QUEUES } from 'src/common/constants/queues';
import { IcellService } from './icell.service';
import { Logger } from '@nestjs/common';

type IcellProcessorJobData = {
  payload: any;
};

@Processor(QUEUES.ICELL)
export class IcellProcessor extends WorkerHost {
  private readonly logger = new Logger(IcellProcessor.name);

  constructor(private readonly icellService: IcellService) {
    super();
  }

  async process(job: Job<IcellProcessorJobData>): Promise<any> {
    try {
      switch (job.name) {
        case ICELL_PROCESSOR_JOBS.PROCESS_SMS_REQUEST:
          await this.icellService.processSmsRequest(job.data.payload);
          break;

        case ICELL_PROCESSOR_JOBS.PROCESS_DATASYNC_REQUEST:
          await this.icellService.processDatasyncNotification(job.data.payload);
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
