import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  CurrentUser,
  PageOptionsDto,
  ReligionMustMatch,
  SubscriptionRequired,
} from 'src/common';
import { CurrentUserReligionInterceptor } from 'src/common/interceptors/current-user-religion.interceptor';
import { ResponseUtilsService } from '../utils';
import { QuizService } from './quiz.service';
import {
  SimpleQuizAttemptDto,
  DetailedQuizSetResponseDto,
  QuizSubmissionStatusResponseDto,
  DetailedQuizAttemptWithWalletHistoryPaginatedResponseDto,
} from 'src/common/dto/quiz';
import { CurrentUserReligion } from 'src/common/decorators/current-user-religion.decorator';
import { Religion } from '@prisma/client';
import { Response } from 'express';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { ApiStandardSuccessDecorator } from 'src/common/decorators/api-standard-success.decorator';
import { QuizAttemptInterceptor } from 'src/common/interceptors/quiz-attempt.interceptor';
import { SubscriptionAccessInterceptor } from 'src/common/interceptors/subscription-access.interceptor';

@ApiBearerAuth()
@ApiTags('Quizzes')
@Controller('quizzes')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@ReligionMustMatch()
@SubscriptionRequired()
@AuthorizationRequired()
@UseInterceptors(CurrentUserReligionInterceptor)
@UseInterceptors(SubscriptionAccessInterceptor)
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's quiz" })
  @ApiOkResponse({
    description: 'Quiz fetched successfully',
    type: DetailedQuizSetResponseDto,
  })
  async getTodaysQuiz(
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.quizService.getTodaysQuizWithQuestions(religion);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('attempts')
  @ApiOperation({ summary: 'Get quiz attempts' })
  @ApiOkResponse({
    description: 'Quiz attempts fetched successfully',
    type: DetailedQuizAttemptWithWalletHistoryPaginatedResponseDto,
    isArray: true,
  })
  async getQuizAttempts(
    @CurrentUser() user: UserEntity,
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.quizService.getQuizAttempts(
      user,
      pageOptionsDto,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('submission-status')
  @ApiOperation({ summary: 'Check if user has submitted quiz for today' })
  @ApiOkResponse({
    description: 'Quiz submission status checked successfully',
    type: QuizSubmissionStatusResponseDto,
  })
  async checkQuizSubmissionStatus(
    @CurrentUser() user: UserEntity,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.quizService.checkUserQuizSubmissionToday(
      user,
      religion,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post('submit')
  @UseInterceptors(QuizAttemptInterceptor)
  @ApiOperation({ summary: "Submit a quiz attempt for today's quiz set" })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Quiz attempt submission failed')
  @ApiStandardSuccessDecorator('Quiz attempt submitted successfully')
  async submitQuizAttempt(
    @Body() quizAttempt: SimpleQuizAttemptDto,
    @CurrentUser() currentUser: UserEntity,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.quizService.submitQuizAttempt(
      religion,
      currentUser,
      quizAttempt,
    );
    return this.response.sendResponse(res, serviceResponse);
  }
}
