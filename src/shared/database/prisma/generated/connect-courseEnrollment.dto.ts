import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseEnrollmentUserIdCourseIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;
}

@ApiExtraModels(CourseEnrollmentUserIdCourseIdUniqueInputDto)
export class ConnectCourseEnrollmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: CourseEnrollmentUserIdCourseIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourseEnrollmentUserIdCourseIdUniqueInputDto)
  userId_courseId?: CourseEnrollmentUserIdCourseIdUniqueInputDto;
}
