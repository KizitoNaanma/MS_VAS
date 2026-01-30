import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class QuizAttemptDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
