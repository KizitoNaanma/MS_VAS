import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Religion } from '@prisma/client';
import { Queue } from 'bullmq';
import { QUEUES, QUIZ_JOBS } from 'src/common/constants/queues';
import { PrismaService } from 'src/common/services/database/prisma';

type QuizCronJobPayload = {
  religion: Religion;
};

@Injectable()
export class QuizCronService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(QUEUES.QUIZ_JOBS)
    private quizQueue: Queue,
  ) {}

  async onModuleInit() {
    const religions = await this.prismaService.religion.findMany();

    await Promise.all(
      religions.map((religion) => {
        const payload: QuizCronJobPayload = {
          religion,
        };

        return this.setupCronJob(
          this.quizQueue,
          QUIZ_JOBS.PROCESS_QUIZ_WINNING_REWARDS,
          payload,
          '59 23 * * *', // Runs at 11:59pm every day
          `${religion.name}-${religion.id}`,
        );
      }),
    );
  }

  private async setupCronJob(
    queue: Queue,
    jobName: string,
    payload: QuizCronJobPayload,
    pattern: string,
    jobId?: string,
  ) {
    // remove all old instances
    const repeatableJobs = await queue.getJobSchedulers();

    for (const job of repeatableJobs) {
      if (job.name === jobName) {
        await queue.removeJobScheduler(job.key);
      }
    }

    await queue.add(
      jobName,
      {
        payload,
      },
      {
        jobId,
        repeat: {
          pattern: pattern,
          tz: 'Africa/Lagos',
        },
        removeOnComplete: true,
        removeOnFail: 10, // Keep last 10 failed jobs for debugging
      },
    );
  }
}
