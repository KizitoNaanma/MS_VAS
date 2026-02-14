import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { CourseService } from './course.service';
import {
  AuthorizationRequired,
  CourseEnrollmentResponseDto,
  CourseEnrollmentDetailsResponseDto,
  CoursePaginatedResponseDto,
  GetCurrentUser,
  PageOptionsDto,
  GetEnrollmentsQueryDto,
  CourseEnrollmentSummaryPaginatedResponseDto,
  CourseProgressReportDto,
  CourseLessonProgressResponseDto,
  LessonCompletionResponseDto,
  CourseCategoryResponseDto,
  CourseResponseDto,
  CourseLessonDetailsResponseDto,
  SubscriptionRequired,
} from 'src/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseUtilsService } from 'src/modules/utils';
import { ApiErrorDecorator } from 'src/common';
import { CurrentUserReligionInterceptor } from 'src/common/interceptors/current-user-religion.interceptor';
import { CurrentUserReligion } from 'src/common/decorators/current-user-religion.decorator';
import { Religion } from '@prisma/client';
import { Response } from 'express';
import { SubscriptionAccessInterceptor } from 'src/common/interceptors/subscription-access.interceptor';

@ApiBearerAuth()
@ApiTags('Courses')
@Controller('courses')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@SubscriptionRequired()
@AuthorizationRequired()
@UseInterceptors(CurrentUserReligionInterceptor)
@UseInterceptors(SubscriptionAccessInterceptor)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get courses' })
  @ApiOkResponse({
    description: 'Courses fetched successfully',
    type: CoursePaginatedResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Courses not found')
  async getCourses(
    @Query() pageOptionsDto: PageOptionsDto,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.courseService.getCourses(
      pageOptionsDto,
      religion,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get course categories' })
  @ApiOkResponse({
    description: 'Course categories fetched successfully',
    type: [CourseCategoryResponseDto],
  })
  async getCourseCategories(
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.courseService.getCourseCategories(religion);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Get user course enrollments' })
  @ApiOkResponse({
    description: 'User enrollments retrieved successfully',
    type: CourseEnrollmentSummaryPaginatedResponseDto,
  })
  async getUserEnrollments(
    @GetCurrentUser('id') userId: string,
    @Query() query: GetEnrollmentsQueryDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.courseService.getUserEnrollments(
      userId,
      query,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search courses' })
  @ApiOkResponse({
    description: 'Courses fetched successfully',
    type: [CourseResponseDto],
  })
  async searchCourses(
    @CurrentUserReligion() religion: Religion,
    @Query('query') query: string,
    @Res() res: Response,
  ) {
    if (
      typeof query !== 'string' ||
      query === undefined ||
      query === null ||
      query.trim() === ''
    ) {
      return this.response.sendResponse(
        res,
        {
          success: false,
          message: 'Query parameter is required and cannot be empty.',
          data: [],
        },
        {
          errorResponseFn: 'error400Response',
        },
      );
    }
    const serviceResponse = await this.courseService.searchCourses(
      religion,
      query,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':categoryId')
  @ApiOperation({ summary: 'Get courses by category' })
  @ApiOkResponse({
    description: 'Courses fetched successfully',
    type: [CourseResponseDto],
  })
  async getCoursesByCategory(
    @Param('categoryId') categoryId: string,
    @CurrentUserReligion() religion: Religion,
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.courseService.getCoursesByCategory(
      categoryId,
      religion,
      pageOptionsDto,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post(':courseId/enroll')
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiOkResponse({
    description: 'Successfully enrolled in course',
    type: CourseEnrollmentResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Course not found')
  @ApiErrorDecorator(HttpStatus.CONFLICT, 'Already enrolled in this course')
  async enrollInCourse(
    @Param('courseId') courseId: string,
    @GetCurrentUser('id') userId: string,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.courseService.enrollInCourse(
      userId,
      courseId,
      religion,
    );

    return this.response.sendResponse(res, serviceResponse);
  }

  @Delete(':courseId/enrollment')
  @ApiOperation({ summary: 'Drop/cancel course enrollment' })
  @ApiOkResponse({
    description: 'Successfully dropped course enrollment',
    type: CourseEnrollmentResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Enrollment not found')
  async dropCourseEnrollment(
    @Param('courseId') courseId: string,
    @GetCurrentUser('id') userId: string,
    @Res() res: Response,
    @Query('preserveHistory') preserveHistory?: boolean,
  ) {
    const serviceResponse = await this.courseService.dropCourseEnrollment(
      userId,
      courseId,
      preserveHistory,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':courseId/enrollment')
  @ApiOperation({ summary: 'Get course enrollment details' })
  @ApiOkResponse({
    description: 'Successfully retrieved course enrollment details',
    type: CourseEnrollmentDetailsResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Enrollment not found')
  async getEnrollmentDetails(
    @Param('courseId') courseId: string,
    @GetCurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.courseService.getEnrollmentDetails(
      userId,
      courseId,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':courseId/progress')
  @ApiOperation({ summary: 'Get detailed course progress report' })
  @ApiOkResponse({
    description: 'Course progress report retrieved successfully',
    type: CourseProgressReportDto,
  })
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Enrollment not found')
  async getCourseProgress(
    @Param('courseId') courseId: string,
    @GetCurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.courseService.getCourseProgress(
      userId,
      courseId,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post(':courseId/lessons/:lessonId/start')
  @ApiOperation({ summary: 'Mark lesson as started' })
  @ApiOkResponse({
    description: 'Lesson marked as started successfully',
    type: CourseLessonProgressResponseDto,
  })
  @ApiErrorDecorator(
    HttpStatus.NOT_FOUND,
    'Course enrollment or lesson not found',
  )
  @ApiErrorDecorator(HttpStatus.CONFLICT, 'Lesson already completed')
  async startLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @GetCurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.courseService.startLesson(
      userId,
      courseId,
      lessonId,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post(':courseId/lessons/:lessonId/complete')
  @ApiOperation({ summary: 'Mark lesson as completed' })
  @ApiOkResponse({
    description: 'Lesson marked as completed successfully',
    type: LessonCompletionResponseDto,
  })
  @ApiErrorDecorator(
    HttpStatus.NOT_FOUND,
    'Course enrollment or lesson not found',
  )
  @ApiErrorDecorator(
    HttpStatus.BAD_REQUEST,
    'Lesson must be started before completion',
  )
  async completeLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @GetCurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.courseService.completeLesson(
      userId,
      courseId,
      lessonId,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':courseId/lessons/:lessonId')
  @ApiOperation({ summary: 'Get lesson details' })
  @ApiOkResponse({
    description: 'Lesson details retrieved successfully',
    type: CourseLessonDetailsResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Lesson not found')
  async getLessonDetails(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @GetCurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.courseService.getLessonDetails(
      userId,
      courseId,
      lessonId,
    );
    return this.response.sendResponse(res, serviceResponse);
  }
}
