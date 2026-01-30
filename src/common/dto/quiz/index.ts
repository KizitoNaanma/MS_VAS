import { ApiProperty, PickType } from '@nestjs/swagger';

import { QuizSetEntity } from 'src/shared/database/prisma/generated/quizSet.entity';
import { QuizQuestionEntity } from 'src/shared/database/prisma/generated/quizQuestion.entity';
import { QuizAnswerOptionEntity } from 'src/shared/database/prisma/generated/quizAnswerOption.entity';
import { QuizUserAnswerEntity } from 'src/shared/database/prisma/generated/quizUserAnswer.entity';
import { QuizAttemptEntity } from 'src/shared/database/prisma/generated/quizAttempt.entity';
import { SimpleWalletHistoryResponseDto } from '../wallet';
import { PageDto } from '../pagination';

export class SimpleQuizAnswerOptionEntity extends PickType(
  QuizAnswerOptionEntity,
  ['id', 'content'],
) {}

export class SimpleQuizQuestionEntity extends PickType(QuizQuestionEntity, [
  'id',
  'content',
  'ordering',
]) {
  @ApiProperty({
    type: () => [SimpleQuizAnswerOptionEntity],
  })
  answerOptions: SimpleQuizAnswerOptionEntity[];
}

export class SimpleQuizSetEntity extends PickType(QuizSetEntity, [
  'id',
  'title',
  'description',
  'dayId',
  'religionId',
]) {}

export class DetailedQuizSetResponseDto extends PickType(QuizSetEntity, [
  'id',
  'title',
  'description',
  'timeLimit',
]) {
  @ApiProperty({
    type: () => [SimpleQuizQuestionEntity],
  })
  questions: SimpleQuizQuestionEntity[];
}

export class QuizUserAnswerDto extends PickType(QuizUserAnswerEntity, [
  'questionId',
  'answerOptionId',
]) {}

export class SimpleQuizAttemptDto extends PickType(QuizAttemptEntity, [
  'quizSetId',
  'startedAt',
  'completedAt',
]) {
  @ApiProperty({
    type: () => QuizUserAnswerDto,
    isArray: true,
    required: true,
  })
  userAnswers: QuizUserAnswerDto[];
}

export class DetailedQuizAttemptDto extends PickType(QuizAttemptEntity, [
  'id',
  'score',
  'isPassed',
  'startedAt',
  'completedAt',
]) {
  @ApiProperty({
    type: 'number',
    description: 'Index of the attempt in the quiz set',
  })
  attemptIndex: number;

  @ApiProperty({
    type: 'number',
    description: 'Total number of attempts for the quiz set',
  })
  totalAttempts: number;
  @ApiProperty({
    type: () => SimpleQuizSetEntity,
  })
  quizSet: SimpleQuizSetEntity;
}

export class DetailedQuizAttemptWithWalletHistoryResponseDto extends DetailedQuizAttemptDto {
  @ApiProperty({
    type: SimpleWalletHistoryResponseDto,
  })
  walletHistory: SimpleWalletHistoryResponseDto;
}

export class DetailedQuizAttemptWithWalletHistoryPaginatedResponseDto extends PageDto<DetailedQuizAttemptWithWalletHistoryResponseDto> {
  @ApiProperty({
    type: () => [DetailedQuizAttemptWithWalletHistoryResponseDto],
  })
  data: DetailedQuizAttemptWithWalletHistoryResponseDto[];
}

export class QuizSubmissionStatusResponseDto {
  @ApiProperty({
    type: 'boolean',
    description: 'Whether the user has submitted a quiz for today',
  })
  hasSubmittedToday: boolean;
}
