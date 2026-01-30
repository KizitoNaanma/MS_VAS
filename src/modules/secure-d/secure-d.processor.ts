import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, SECURE_D_PROCESSOR_JOBS } from 'src/common/constants/queues';
import { SecureDNotificationRequestDto } from 'src/common/dto/secure-d';
import { SecureDService } from './secure-d.service';

@Processor(QUEUES.SECURE_D)
export class SecureDProcessor extends WorkerHost {
  private readonly logger = new Logger(SecureDProcessor.name);

  constructor(private readonly secureDService: SecureDService) {
    super();
  }

  async process(
    job: Job<{ payload: SecureDNotificationRequestDto }>,
  ): Promise<void> {
    const { name } = job;
    const payload = job.data?.payload;

    if (name !== SECURE_D_PROCESSOR_JOBS.PROCESS_SECURE_D_NOTIFICATION) {
      this.logger.warn(`Ignored job with unexpected name: ${name}`);
      return;
    }

    if (!payload) {
      this.logger.warn('SecureD job missing payload; skipping.');
      return;
    }

    await this.secureDService.processNotification(payload);
  }
}
