import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUES, QUIZ_JOBS } from 'src/common/constants/queues';
import { QuizService } from './quiz.service';
import { Logger } from '@nestjs/common';

type QuizProcessorJobData = {
  payload: any;
};

@Processor(QUEUES.QUIZ_JOBS)
export class QuizProcessor extends WorkerHost {
  private readonly logger = new Logger(QuizProcessor.name);
  constructor(private readonly quizService: QuizService) {
    super();
  }

  async process(job: Job<QuizProcessorJobData>): Promise<any> {
    try {
      switch (job.name) {
        case QUIZ_JOBS.PROCESS_QUIZ_GRADING:
          this.logger.log(`Processing quiz grading for job ${job.id}`);

          await this.quizService.processQuizGrading(job.data.payload);
          break;
        case QUIZ_JOBS.PROCESS_QUIZ_WINNING_REWARDS:
          this.logger.log(`Processing quiz winning rewards for job ${job.id}`);
          await this.quizService.publishAllTodaysQuizAttempts(job.data.payload);
          await this.quizService.processQuizWinningRewards(job.data.payload);
          await this.quizService.notifyQuizWinners(job.data.payload);
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
