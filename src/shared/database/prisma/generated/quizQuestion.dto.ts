import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestionDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
    type: 'integer',
    format: 'int32',
  })
  ordering: number;
}
