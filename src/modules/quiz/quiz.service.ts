import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/common/services/database/prisma';
import { TimeUtilsService } from '../utils';
import { Prisma, Religion, WalletTransactionType } from '@prisma/client';
import {
  IServiceResponse,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
  QUIZ_WINNINGS_POOL_AMOUNT,
} from 'src/common';
import {
  SimpleQuizAttemptDto,
  DetailedQuizSetResponseDto,
  SimpleQuizQuestionEntity,
  SimpleQuizSetEntity,
  DetailedQuizAttemptWithWalletHistoryPaginatedResponseDto,
} from 'src/common/dto/quiz';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUES, QUIZ_JOBS } from 'src/common/constants/queues';
import { Queue } from 'bullmq';
import { PaymentService } from '../payment/payment.service';
import { OutgoingSmsPayloadDto } from 'src/common/dto/icell';
import { IcellClient } from '../../shared/icell-core/services/icell.client';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    private readonly timeUtils: TimeUtilsService,
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly icellClient: IcellClient,
    @InjectQueue(QUEUES.QUIZ_JOBS) private quizQueue: Queue,
  ) {}

  /**
   * Returns a deterministically randomized subset of questions.
   * An implementation of the Fisher-Yates shuffle algorithm with a fixed seed.
   * Always returns the same 5 questions from the provided array.
   * @param items Array of items
   * @param count Number of items to return (default: 5)
   * @returns A subset of the items array
   */
  private getRandomizedQuestions(
    items: SimpleQuizQuestionEntity[],
    count: number = 5,
  ): SimpleQuizQuestionEntity[] {
    // Use a fixed seed to make the randomization deterministic
    const seed = 365; // Any constant number would work

    // Simple deterministic shuffle algorithm (Fisher-Yates with fixed seed)
    const shuffled = [...items];

    // Create a deterministic random number generator
    const random = (i: number) => {
      const x = Math.sin(i + seed) * 10000;
      return x - Math.floor(x);
    };

    // Shuffle the array using the deterministic random function
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random(i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Take the first 'count' elements
    const slicedQuestions = shuffled.slice(0, count);

    // sort the sliced questions by ordering
    slicedQuestions.sort((a, b) => a.ordering - b.ordering);

    // return the sliced questions
    return slicedQuestions;
  }

  async getTodaysSimpleQuizSet(
    religion: Religion,
  ): Promise<SimpleQuizSetEntity> {
    const dayOfYear = this.timeUtils.getDayOfYear();
    const quiz = await this.prismaService.quizSet.findFirst({
      where: { dayId: dayOfYear, religionId: religion.id },
      select: {
        id: true,
        title: true,
        description: true,
        dayId: true,
        religionId: true,
      },
    });
    return quiz;
  }

  async getTodaysDetailedQuizSet(
    religion: Religion,
  ): Promise<DetailedQuizSetResponseDto> {
    const dayOfYear = this.timeUtils.getDayOfYear();
    const quiz = await this.prismaService.quizSet.findFirst({
      where: { dayId: dayOfYear, religionId: religion.id },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        questions: {
          select: {
            id: true,
            content: true,
            ordering: true,
            answerOptions: {
              select: {
                id: true,
                content: true,
              },
            },
          },
          orderBy: {
            ordering: 'asc',
          },
        },
      },
    });

    return quiz;
  }

  async getTodaysDetailedQuizSetWithAnswers(religion: Religion) {
    const dayOfYear = this.timeUtils.getDayOfYear();
    const quiz = await this.prismaService.quizSet.findFirst({
      where: { dayId: dayOfYear, religionId: religion.id },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        passingScore: true,
        questions: {
          select: {
            id: true,
            content: true,
            ordering: true,
            answerOptions: {
              select: {
                id: true,
                content: true,
                isCorrect: true,
              },
            },
          },
          orderBy: {
            ordering: 'asc',
          },
        },
      },
    });

    return quiz;
  }

  async getTodaysQuizWithQuestions(
    religion: Religion,
  ): Promise<IServiceResponse<DetailedQuizSetResponseDto>> {
    const quiz = await this.getTodaysDetailedQuizSet(religion);

    // randomize the questions
    quiz.questions = this.getRandomizedQuestions(quiz.questions);

    return {
      success: true,
      message: 'Quiz fetched successfully',
      data: quiz,
    };
  }

  async submitQuizAttempt(
    religion: Religion,
    currentUser: UserEntity,
    quizAttempt: SimpleQuizAttemptDto,
  ): Promise<IServiceResponse> {
    try {
      const quizSet = await this.getTodaysSimpleQuizSet(religion);

      const txnResult = await this.prismaService.$transaction(async (tx) => {
        const quizAttemptRecord = await tx.quizAttempt.create({
          data: {
            quizSetId: quizSet.id,
            userId: currentUser.id,
            startedAt: quizAttempt.startedAt,
            completedAt: quizAttempt.completedAt,
          },
          select: {
            id: true,
          },
        });

        await tx.quizUserAnswer.createMany({
          data: quizAttempt.userAnswers.map((answer) => ({
            attemptId: quizAttemptRecord.id,
            userId: currentUser.id,
            questionId: answer.questionId,
            answerOptionId: answer.answerOptionId,
          })),
        });

        const createdUserAnswers = await tx.quizUserAnswer.findMany({
          where: {
            attemptId: quizAttemptRecord.id,
            userId: currentUser.id,
          },
        });

        await tx.quizAttempt.update({
          where: { id: quizAttemptRecord.id },
          data: {
            userAnswers: {
              connect: createdUserAnswers.map((answer) => ({
                id: answer.id,
              })),
            },
          },
        });

        return quizAttemptRecord;
      });

      await this.quizQueue.add(QUIZ_JOBS.PROCESS_QUIZ_GRADING, {
        payload: {
          quizAttemptId: txnResult.id,
          religion: religion,
        },
      });

      // send sms to the user from the service code
      const smsMessage = `Your quiz submission has been received. Expect an update to your quiz submission by midnight. You are welcome to make another submission attempt.`;
      const responseSms = new OutgoingSmsPayloadDto(smsMessage, [
        currentUser.phone,
      ]);
      await this.icellClient.sendSmsHttpRequest(responseSms);

      return {
        success: true,
        message: 'Quiz attempt submitted successfully',
        data: null,
      };
    } catch (error) {
      if (error.message.includes('Foreign key constraint violated')) {
        throw new BadRequestException(
          'One or more selected answer options are invalid',
        );
      }

      // TODO: Fix error logging to file and not console
      // console.log('🚀 ~ QuizService ~ error:', error.message);
      throw new InternalServerErrorException('Failed to save quiz answers');
    }
  }

  async processQuizGrading(payload: {
    quizAttemptId: string;
    religion: Religion;
  }): Promise<void> {
    const { quizAttemptId, religion } = payload;

    const quizAttempt = await this.prismaService.quizAttempt.findUnique({
      where: { id: quizAttemptId, isGraded: false, isPublished: false },
      select: {
        id: true,
        score: true,
        userAnswers: {
          select: {
            id: true,
            questionId: true,
            answerOptionId: true,
          },
        },
      },
    });
    const quizSet = await this.getTodaysDetailedQuizSetWithAnswers(religion);
    const questionUnitScore = quizSet.passingScore.toNumber() / 5;
    const userAnswers = quizAttempt.userAnswers;

    for (const userAnswer of userAnswers) {
      const question = quizSet.questions.find(
        (question) => question.id === userAnswer.questionId,
      );

      const answerOption = question.answerOptions.find(
        (option) => option.id === userAnswer.answerOptionId,
      );

      if (answerOption.isCorrect) {
        quizAttempt.score = quizAttempt.score.plus(questionUnitScore);
        await this.prismaService.quizUserAnswer.update({
          where: { id: userAnswer.id },
          data: { isCorrect: true },
        });
      }
    }

    await this.prismaService.quizAttempt.update({
      where: { id: quizAttempt.id },
      data: {
        score: quizAttempt.score,
        isGraded: true,
        isPassed:
          quizAttempt.score.toNumber() === quizSet.passingScore.toNumber(),
      },
    });
  }

  async getQuizAttempts(
    user: UserEntity,
    pageOptionsDto: PageOptionsDto,
  ): Promise<
    IServiceResponse<DetailedQuizAttemptWithWalletHistoryPaginatedResponseDto>
  > {
    // Then get the detailed quiz attempts
    const quizAttempts = await this.prismaService.quizAttempt.findMany({
      where: { userId: user.id, isGraded: true, isPublished: true },
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.pageSize,
      select: {
        id: true,
        score: true,
        isPassed: true,
        startedAt: true,
        completedAt: true,
        quizSetId: true,
        quizSet: {
          select: {
            id: true,
            title: true,
            description: true,
            dayId: true,
            religionId: true,
          },
        },
        walletHistory: {
          select: {
            amount: true,
            description: true,
            transactionType: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group attempts by quizSetId to calculate per-quiz-set attempt indices
    const attemptsGroupedByQuizSet = new Map<string, typeof quizAttempts>();

    for (const attempt of quizAttempts) {
      const quizSetId = attempt.quizSetId;
      if (!attemptsGroupedByQuizSet.has(quizSetId)) {
        attemptsGroupedByQuizSet.set(quizSetId, []);
      }
      attemptsGroupedByQuizSet.get(quizSetId).push(attempt);
    }

    // Map attempts with correct attemptIndex and totalAttempts per quiz set
    const quizAttemptsWithWalletHistory = quizAttempts.map((attempt) => {
      const quizSetAttempts = attemptsGroupedByQuizSet.get(attempt.quizSetId);
      const attemptIndex =
        quizSetAttempts.findIndex((a) => a.id === attempt.id) + 1;
      const totalAttempts = quizSetAttempts.length;

      return {
        ...attempt,
        attemptIndex,
        totalAttempts,
      };
    });

    const itemCount = await this.prismaService.quizAttempt.count({
      where: { userId: user.id, isGraded: true, isPublished: true },
    });

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return {
      success: true,
      message: 'Quiz attempts fetched successfully',
      data: new PageDto(
        quizAttemptsWithWalletHistory,
        pageMetaDto,
      ) as unknown as DetailedQuizAttemptWithWalletHistoryPaginatedResponseDto,
    };
  }

  private async getTodaysQuizAttempts(
    religion: Religion,
    filters: {
      isPublished?: boolean;
      isPassed?: boolean;
    } = {},
  ) {
    const quiz = await this.getTodaysSimpleQuizSet(religion);

    const where: Prisma.QuizAttemptWhereInput = {
      quizSetId: quiz.id,
      isPublished: filters.isPublished ?? false,
    };

    // Only add isPassed filter if explicitly provided
    if (filters.isPassed !== undefined) {
      where.isPassed = filters.isPassed;
    }

    const quizAttempts = await this.prismaService.quizAttempt.findMany({
      where,
      select: {
        id: true,
        userId: true,
      },
    });

    return quizAttempts;
  }

  async publishAllTodaysQuizAttempts(payload: { religion: Religion }) {
    this.logger.log(
      `Publishing all todays quiz attempts for religion: ${payload.religion.code}`,
    );
    const { religion } = payload;
    const todaysQuizAttempts = await this.getTodaysQuizAttempts(religion);
    await this.prismaService.quizAttempt.updateMany({
      where: { id: { in: todaysQuizAttempts.map((attempt) => attempt.id) } },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  async processQuizWinningRewards(payload: { religion: Religion }) {
    this.logger.log(
      `Processing quiz winning rewards for religion: ${payload.religion.code}`,
    );
    const { religion } = payload;

    const quizSet = await this.getTodaysDetailedQuizSet(religion);
    const quizWinningsPoolAmount = parseInt(QUIZ_WINNINGS_POOL_AMOUNT);

    const publishedWinningQuizAttempts = await this.getTodaysQuizAttempts(
      religion,
      {
        isPublished: true,
        isPassed: true,
      },
    );

    // If no winners, exit early
    if (publishedWinningQuizAttempts.length === 0) return;

    // Group winning attempts by user ID to get unique users and their attempt counts
    const userWinningAttemptsMap = new Map<
      string,
      { count: number; attemptIds: string[] }
    >();

    for (const attempt of publishedWinningQuizAttempts) {
      const userId = attempt.userId;
      userWinningAttemptsMap.set(userId, {
        count: (userWinningAttemptsMap.get(userId)?.count || 0) + 1,
        attemptIds: [
          ...(userWinningAttemptsMap.get(userId)?.attemptIds || []),
          attempt.id,
        ],
      });
    }

    const totalWinningAttempts = publishedWinningQuizAttempts.length;

    // Process rewards for each unique user based on their percentage of winning attempts
    for (const [
      userId,
      { count: attemptCount, attemptIds },
    ] of userWinningAttemptsMap.entries()) {
      const userWinningPercentage = attemptCount / totalWinningAttempts;

      const userRewardAmount = quizWinningsPoolAmount * userWinningPercentage;

      const userRewardPerAttempt = userRewardAmount / attemptCount;

      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      // Credit the user's wallet for each of their winning attempts
      for (const attemptId of attemptIds) {
        await this.paymentService.creditUserWallet(
          user,
          userRewardPerAttempt,
          WalletTransactionType.QUIZ_REWARD,
          `Winning reward for ${quizSet.title}`,
          attemptId,
        );
      }

      // Log the total reward credited to the user for transparency
      this.logger.log(
        `Credited total of ${userRewardAmount} to user ${user.phone} for ${attemptCount} winning attempts.`,
      );
    }
  }

  async checkUserQuizSubmissionToday(
    user: UserEntity,
    religion: Religion,
  ): Promise<IServiceResponse<{ hasSubmittedToday: boolean }>> {
    try {
      const quizSet = await this.getTodaysSimpleQuizSet(religion);

      if (!quizSet) {
        return {
          success: true,
          message: 'No quiz available for today',
          data: { hasSubmittedToday: false },
        };
      }

      const quizAttempt = await this.prismaService.quizAttempt.findFirst({
        where: {
          userId: user.id,
          quizSetId: quizSet.id,
        },
        select: {
          id: true,
        },
      });

      return {
        success: true,
        message: 'Quiz submission status checked successfully',
        data: { hasSubmittedToday: !!quizAttempt },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async notifyQuizWinners(payload: { religion: Religion }) {
    this.logger.log(
      `Notifying quiz winners for religion: ${payload.religion.code}`,
    );
    const { religion } = payload;
    const todaysWinningQuizAttempts = await this.getTodaysQuizAttempts(
      religion,
      {
        isPublished: true,
        isPassed: true,
      },
    );

    const userIds = todaysWinningQuizAttempts.map((attempt) => attempt.userId);
    const users = await this.prismaService.user.findMany({
      where: { id: { in: userIds } },
      select: { phone: true, id: true },
    });

    const usersMsisdns = users.map((user) => user.phone);

    // if no users to notify, return early
    if (usersMsisdns.length === 0) {
      return;
    }

    const smsMessage = `Congratulations! You have won the quiz for today, and your reward has been credited to your wallet. Log in to your account to view your balance.`;

    const responseSms = new OutgoingSmsPayloadDto(smsMessage, usersMsisdns);
    // send sms to the user from the service code
    await this.icellClient.sendSmsHttpRequest(responseSms);
  }
}
