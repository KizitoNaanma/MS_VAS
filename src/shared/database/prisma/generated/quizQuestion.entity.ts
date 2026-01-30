import { ApiProperty } from '@nestjs/swagger';
import { QuizSetEntity } from './quizSet.entity';
import { QuizAnswerOptionEntity } from './quizAnswerOption.entity';
import { QuizUserAnswerEntity } from './quizUserAnswer.entity';

export class QuizQuestionEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => QuizSetEntity,
    required: false,
  })
  quizSet?: QuizSetEntity;
  @ApiProperty({
    type: 'string',
  })
  quizSetId: string;
  @ApiProperty({
    type: 'string',
  })
  content: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  points: number;
  @ApiProperty({
    type: () => QuizAnswerOptionEntity,
    isArray: true,
    required: false,
  })
  answerOptions?: QuizAnswerOptionEntity[];
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  correctAnswerId: string | null;
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
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  ordering: number;
}
