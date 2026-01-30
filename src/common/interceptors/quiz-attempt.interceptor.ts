import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrismaService } from '../services/database/prisma';

@Injectable()
export class QuizAttemptInterceptor implements NestInterceptor {
  constructor(private readonly prismaService: PrismaService) {}

  private async checkQuizAttemptsAvailable(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        availableQuizAttempts: true,
      },
    });

    return user.availableQuizAttempts > 0;
  }

  // private async checkHasUserCompletedQuizToday(user: UserEntity) {
  //   const userReligion = await this.prismaService.religion.findFirst({
  //     where: {
  //       code: user.religion,
  //     },
  //   });
  //   const quizSet = await this.quizService.getTodaysSimpleQuizSet(userReligion);
  //   const quizAttempts = await this.prismaService.quizAttempt.findMany({
  //     where: {
  //       userId: user.id,
  //       quizSetId: quizSet.id,
  //     },
  //     select: {
  //       id: true,
  //     },
  //   });

  //   return quizAttempts.length > 0;
  // }

  private async decrementQuizAttempts(userId: string) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { availableQuizAttempts: { decrement: 1 } },
    });
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasQuizAttemptsAvailable = await this.checkQuizAttemptsAvailable(
      user.id,
    );

    if (!hasQuizAttemptsAvailable) {
      throw new ForbiddenException('No quiz attempts available');
    }

    return next.handle().pipe(
      tap(async () => {
        await this.decrementQuizAttempts(user.id);
      }),
      catchError((error) => {
        // Don't increment access count if there was an error
        return throwError(() => error);
      }),
    );
  }
}
