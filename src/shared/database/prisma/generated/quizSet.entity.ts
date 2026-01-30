import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ReligionEntity } from './religion.entity';
import { ThemeEntity } from './theme.entity';
import { QuizQuestionEntity } from './quizQuestion.entity';
import { QuizAttemptEntity } from './quizAttempt.entity';

export class QuizSetEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  dayId: number;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
  })
  description: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  timeLimit: number | null;
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  passingScore: Prisma.Decimal;
  @ApiProperty({
    type: () => ReligionEntity,
    required: false,
    nullable: true,
  })
  religion?: ReligionEntity | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  religionId: string | null;
  @ApiProperty({
    type: () => ThemeEntity,
    required: false,
  })
  theme?: ThemeEntity;
  @ApiProperty({
    type: 'string',
  })
  themeId: string;
  @ApiProperty({
    type: 'boolean',
  })
  isActive: boolean;
  @ApiProperty({
    type: () => QuizQuestionEntity,
    isArray: true,
    required: false,
  })
  questions?: QuizQuestionEntity[];
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
    type: () => QuizAttemptEntity,
    isArray: true,
    required: false,
  })
  attempts?: QuizAttemptEntity[];
}
