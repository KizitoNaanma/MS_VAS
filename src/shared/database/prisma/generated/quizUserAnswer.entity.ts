import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { QuizAttemptEntity } from './quizAttempt.entity';
import { QuizQuestionEntity } from './quizQuestion.entity';
import { QuizAnswerOptionEntity } from './quizAnswerOption.entity';

export class QuizUserAnswerEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => UserEntity,
    required: false,
  })
  user?: UserEntity;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    type: () => QuizAttemptEntity,
    required: false,
  })
  attempt?: QuizAttemptEntity;
  @ApiProperty({
    type: 'string',
  })
  attemptId: string;
  @ApiProperty({
    type: () => QuizQuestionEntity,
    required: false,
  })
  question?: QuizQuestionEntity;
  @ApiProperty({
    type: 'string',
  })
  questionId: string;
  @ApiProperty({
    type: () => QuizAnswerOptionEntity,
    required: false,
  })
  answerOption?: QuizAnswerOptionEntity;
  @ApiProperty({
    type: 'string',
  })
  answerOptionId: string;
  @ApiProperty({
    type: 'boolean',
  })
  isCorrect: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
