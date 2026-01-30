import { ApiProperty } from '@nestjs/swagger';

export class QuizAnswerOptionDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
}
