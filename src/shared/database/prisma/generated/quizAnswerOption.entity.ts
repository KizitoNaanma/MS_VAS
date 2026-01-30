import { ApiProperty } from '@nestjs/swagger';
import { QuizQuestionEntity } from './quizQuestion.entity';
import { QuizUserAnswerEntity } from './quizUserAnswer.entity';

export class QuizAnswerOptionEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
    type: 'string',
  })
  content: string;
  @ApiProperty({
    type: 'boolean',
  })
  isCorrect: boolean;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  explanation: string | null;
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
  @ApiProperty({
    type: () => QuizUserAnswerEntity,
    isArray: true,
    required: false,
  })
  userAnswers?: QuizUserAnswerEntity[];
}
