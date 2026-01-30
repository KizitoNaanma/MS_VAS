import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseLessonProgressEnrollmentIdLessonIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  enrollmentId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  lessonId: string;
}

@ApiExtraModels(CourseLessonProgressEnrollmentIdLessonIdUniqueInputDto)
export class ConnectCourseLessonProgressDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: CourseLessonProgressEnrollmentIdLessonIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourseLessonProgressEnrollmentIdLessonIdUniqueInputDto)
  enrollmentId_lessonId?: CourseLessonProgressEnrollmentIdLessonIdUniqueInputDto;
}
