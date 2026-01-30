import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { CourseEntity } from 'src/shared/database/prisma/generated/course.entity';
import { PageDto, PageOptionsDto } from '../pagination';
import { CourseEnrollmentEntity } from 'src/shared/database/prisma/generated/courseEnrollment.entity';
import { EnrollmentStatus, LessonStatus, Prisma } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CourseCategoryEntity } from 'src/shared/database/prisma/generated/courseCategory.entity';
import { copyNonNullFields, getS3FileUrl } from 'src/modules/utils';
import { CourseAuthorDto } from 'src/shared/database/prisma/generated/courseAuthor.dto';
import { CreateCourseDto } from 'src/shared/database/prisma/generated/create-course.dto';
import { CreateCourseLessonDto } from 'src/shared/database/prisma/generated/create-courseLesson.dto';
export class CourseResponseDto extends PickType(CourseEntity, [
  'name',
  'id',
  'description',
  'duration',
  'isFree',
  'religionId',
  'categoryId',
  'authorId',
  'courseTopicId',
]) {
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  videoUrl: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageUrl: string | null;

  constructor(course: Partial<CourseEntity>) {
    super();
    copyNonNullFields(course, this);
    this.videoUrl = getS3FileUrl(course.videoObjectKey);
    this.imageUrl = getS3FileUrl(course.imageObjectKey);
  }
}

export class CoursePaginatedResponseDto extends PageDto<CourseResponseDto> {
  @ApiProperty({ type: () => [CourseResponseDto] })
  data: CourseResponseDto[];
}

export class CourseCategoryResponseDto extends PickType(CourseCategoryEntity, [
  'id',
  'name',
]) {}

export class CourseEnrollmentResponseDto extends PickType(
  CourseEnrollmentEntity,
  [
    'id',
    'courseId',
    'userId',
    'status',
    'startedAt',
    'completedAt',
    'lastAccessedAt',
    'progress',
  ],
) {}

export class CourseLessonProgressResponseDto {
  @ApiProperty({
    type: 'string',
  })
  lessonId: string;
  @ApiProperty({
    enum: LessonStatus,
  })
  status: LessonStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  startedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  lastAccessedAt: Date | null;
}

export class CourseLessonDetailsResponseDto extends CourseLessonProgressResponseDto {
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  content: string;
}

export class CourseEnrollmentDetailsResponseDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  courseId: string;
  @ApiProperty({
    type: 'string',
  })
  courseName: string;
  @ApiProperty({
    type: 'string',
  })
  courseDescription: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  courseImageUrl: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  courseDuration: number | null;
  @ApiProperty({
    enum: EnrollmentStatus,
  })
  enrollmentStatus: EnrollmentStatus;
  @ApiProperty({
    description: 'The percentage of the course completed',
    type: 'number',
    format: 'double',
  })
  progress: Prisma.Decimal;
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
    type: 'string',
    format: 'date-time',
  })
  lastAccessedAt: Date;
  @ApiProperty({
    type: () => [CourseLessonProgressResponseDto],
    isArray: true,
  })
  lessons: CourseLessonProgressResponseDto[];
}

export class GetEnrollmentsQueryDto extends PageOptionsDto {
  @ApiProperty({
    enum: EnrollmentStatus,
    required: false,
    default: EnrollmentStatus.IN_PROGRESS,
  })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus = EnrollmentStatus.IN_PROGRESS;
}

class CourseLessonsSummaryResponseDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  total: number;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  completed: number;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  inProgress: number;
}

export class CourseEnrollmentSummaryResponseDto extends PickType(
  CourseEnrollmentDetailsResponseDto,
  [
    'id',
    'courseId',
    'courseName',
    'courseDescription',
    'courseImageUrl',
    'startedAt',
    'completedAt',
    'lastAccessedAt',
  ],
) {
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  courseAuthorName: string | null;
  @ApiProperty({
    type: 'string',
  })
  courseCategoryName: string;
  @ApiProperty({
    type: 'string',
  })
  courseTopicName: string;

  @ApiProperty({
    type: 'boolean',
  })
  isFree: boolean;
  @ApiProperty({
    enum: EnrollmentStatus,
  })
  status: EnrollmentStatus;
  @ApiProperty({
    description: 'The percentage of the course completed',
    type: 'number',
    format: 'double',
  })
  progress: Prisma.Decimal;
  @ApiProperty({
    type: CourseLessonsSummaryResponseDto,
  })
  lessonsSummary: CourseLessonsSummaryResponseDto;
}

export class CourseEnrollmentSummaryPaginatedResponseDto extends PageDto<CourseEnrollmentSummaryResponseDto> {
  @ApiProperty({ type: () => [CourseEnrollmentSummaryResponseDto] })
  readonly data: CourseEnrollmentSummaryResponseDto[];
}

export class CourseLessonProgressDetailDto extends CourseLessonProgressResponseDto {
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  ordering: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  timeSpentMinutes: number;
}

export class ProgressStatsDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  totalLessons: number;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  completedLessons: number;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  inProgressLessons: number;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  notStartedLessons: number;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  overallProgress: number;
}

export class CourseProgressReportDto {
  @ApiProperty({
    type: 'string',
  })
  enrollmentId: string;

  @ApiProperty({
    type: 'string',
  })
  courseId: string;

  @ApiProperty({
    type: 'string',
  })
  courseName: string;

  @ApiProperty({ enum: EnrollmentStatus })
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;

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
  completedAt?: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  lastAccessedAt: Date;

  @ApiProperty({
    type: ProgressStatsDto,
  })
  stats: ProgressStatsDto;

  @ApiProperty({ type: [CourseLessonProgressDetailDto] })
  lessonProgress: CourseLessonProgressDetailDto[];
}

export class LessonCompletionResponseDto {
  @ApiProperty({
    type: 'string',
  })
  lessonId: string;
  @ApiProperty({
    enum: LessonStatus,
  })
  status: LessonStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  startedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  timeSpentMinutes: number;
  @ApiProperty({ enum: EnrollmentStatus })
  @IsEnum(EnrollmentStatus)
  courseStatus: EnrollmentStatus;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  courseProgress: number;
  @ApiProperty({
    type: 'boolean',
  })
  isLastLesson: boolean;
}

export class AdminCourseResponseDto extends PickType(CourseEntity, [
  'id',
  'name',
  'description',
  'duration',
  'author',
  'createdAt',
  'updatedAt',
]) {
  @ApiProperty({
    type: CourseCategoryResponseDto,
  })
  category: CourseCategoryResponseDto;

  @ApiProperty({
    type: CourseAuthorDto,
    nullable: true,
  })
  author: CourseAuthorDto | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageUrl: string | null;

  constructor(course: Partial<CourseEntity>) {
    super();
    copyNonNullFields(course, this, ['imageObjectKey']);
    this.imageUrl = getS3FileUrl(course.imageObjectKey);
  }
}

export class AdminCoursePaginatedResponseDto extends PageDto<AdminCourseResponseDto> {
  @ApiProperty({ type: () => [AdminCourseResponseDto] })
  data: AdminCourseResponseDto[];
}

export class AdminCreateCourseLessonDto extends OmitType(
  CreateCourseLessonDto,
  ['ordering'],
) {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  ordering: string;
}

export class AdminCreateCourseDto extends PickType(CreateCourseDto, [
  'name',
  'description',
]) {
  @ApiProperty({
    type: 'string',
  })
  categoryId: string;
  @ApiProperty({
    type: 'file',
    format: 'binary',
    required: false,
  })
  image?: Express.Multer.File;

  @ApiProperty({
    type: () => AdminCreateCourseLessonDto,
    isArray: true,
    required: true,
  })
  lessons?: AdminCreateCourseLessonDto[];
}
