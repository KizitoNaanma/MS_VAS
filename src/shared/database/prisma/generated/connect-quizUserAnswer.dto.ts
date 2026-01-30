import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuizUserAnswerAttemptIdQuestionIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  attemptId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  questionId: string;
}

@ApiExtraModels(QuizUserAnswerAttemptIdQuestionIdUniqueInputDto)
export class ConnectQuizUserAnswerDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: QuizUserAnswerAttemptIdQuestionIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuizUserAnswerAttemptIdQuestionIdUniqueInputDto)
  attemptId_questionId?: QuizUserAnswerAttemptIdQuestionIdUniqueInputDto;
}
