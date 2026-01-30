import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { ResponseUtilsService, TimeUtilsService } from '../utils';
import { QUEUES } from 'src/common/constants/queues';
import { BullModule } from '@nestjs/bullmq';
import { QuizProcessor } from './quiz.processor';
import { PaymentModule } from '../payment/payment.module';
import { QuizCronService } from './quiz-cron.service';
import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

@Module({
  imports: [
    DatabaseServicesModule,
    BullModule.registerQueue({
      name: QUEUES.QUIZ_JOBS,
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    }),
    PaymentModule,
    IcellCoreModule,
  ],
  controllers: [QuizController],
  providers: [
    ResponseUtilsService,
    TimeUtilsService,
    QuizService,
    QuizProcessor,
    QuizCronService,
  ],
})
export class QuizModule {}
