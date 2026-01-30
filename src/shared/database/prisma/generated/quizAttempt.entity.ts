import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { QuizSetEntity } from './quizSet.entity';
import { WalletHistoryEntity } from './walletHistory.entity';
import { QuizUserAnswerEntity } from './quizUserAnswer.entity';

export class QuizAttemptEntity {
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
    format: 'date-time',
  })
  startedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  score: Prisma.Decimal;
  @ApiProperty({
    type: 'boolean',
  })
  isGraded: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isPassed: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isPublished: boolean;
  @ApiProperty({
    type: () => WalletHistoryEntity,
    isArray: true,
    required: false,
  })
  walletHistory?: WalletHistoryEntity[];
  @ApiProperty({
    type: () => QuizUserAnswerEntity,
    isArray: true,
    required: false,
  })
  userAnswers?: QuizUserAnswerEntity[];
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
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  publishedAt: Date | null;
}
