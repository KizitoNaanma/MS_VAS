import { HttpStatus, Injectable } from '@nestjs/common';
import { Course, Prisma, Religion } from '@prisma/client';
import {
  CourseCategoryResponseDto,
  CourseEnrollmentDetailsResponseDto,
  CourseEnrollmentResponseDto,
  CourseEnrollmentSummaryResponseDto,
  CourseLessonDetailsResponseDto,
  CourseLessonProgressDetailDto,
  CourseLessonProgressResponseDto,
  CourseProgressReportDto,
  CourseResponseDto,
  GetEnrollmentsQueryDto,
  IServiceResponse,
  LessonCompletionResponseDto,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
  ProgressStatsDto,
} from 'src/common';
import { PrismaService } from 'src/common/services/database/prisma';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { getS3FileUrl } from '../utils';

@Injectable()
export class CourseService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCourses(
    pageOptionsDto: PageOptionsDto,
    religion: Religion,
  ): Promise<IServiceResponse<PageDto<CourseResponseDto>>> {
    const courses = await this.prismaService.course.findMany({
      where: {
        religion,
      },
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.pageSize,
      orderBy: {
        createdAt: pageOptionsDto.order,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
        videoObjectKey: true,
        imageObjectKey: true,
      },
    });
    const coursesResponseDtos = courses.map(
      (course) => new CourseResponseDto(course),
    );
    const itemCount = await this.prismaService.course.count({
      where: {
        religion,
      },
    });
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
    return {
      success: true,
      message: 'Courses fetched successfully',
      data: new PageDto(coursesResponseDtos, pageMetaDto),
    };
  }

  async searchCourses(
    user: UserEntity,
    query: string,
  ): Promise<IServiceResponse<CourseResponseDto[]>> {
    const searchKeywords = query.trim().split(' ').join(' | ');

    const religion = await this.prismaService.religion.findFirst({
      where: {
        code: user.religion,
      },
    });

    const courses = await this.prismaService.$queryRaw<Course[]>(
      Prisma.sql`SELECT 
      "name",
      "id",
      "description",
      "videoObjectKey",
      "imageObjectKey",
      "duration",
      "isFree",
      "religionId",
      "categoryId",
      "authorId",
      "courseTopicId"
       FROM "Course" WHERE
      to_tsvector('english', "description") @@ to_tsquery(${searchKeywords})
      OR to_tsvector('english', "name") @@ to_tsquery(${searchKeywords})
      OR "Course"."name" ILIKE '%' || ${searchKeywords} || '%'
      OR "Course"."description" ILIKE '%' || ${searchKeywords} || '%'
      AND "Course"."religionId" = ${religion.id};`,
    );

    const coursesResponseDtos = courses.map(
      (course) => new CourseResponseDto(course),
    );

    return {
      success: true,
      message: 'Courses fetched successfully',
      data: coursesResponseDtos,
    };
  }

  async getCourseCategories(
    religion: Religion,
  ): Promise<IServiceResponse<CourseCategoryResponseDto[]>> {
    const categories = await this.prismaService.courseCategory.findMany({
      where: { religion },
      select: {
        id: true,
        name: true,
      },
    });
    return {
      success: true,
      message: 'Course categories fetched successfully',
      data: categories,
    };
  }

  async getCoursesByCategory(
    categoryId: string,
    religion: Religion,
    pageOptionsDto: PageOptionsDto,
  ): Promise<IServiceResponse<PageDto<CourseResponseDto>>> {
    const courses = await this.prismaService.course.findMany({
      where: {
        religion,
        categoryId,
      },
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.pageSize,
      orderBy: {
        createdAt: pageOptionsDto.order,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });
    const coursesResponseDtos = courses.map(
      (course) => new CourseResponseDto(course),
    );
    const itemCount = await this.prismaService.course.count({
      where: {
        religion,
      },
    });
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
    return {
      success: true,
      message: 'Courses fetched successfully',
      data: new PageDto(coursesResponseDtos, pageMetaDto),
    };
  }

  async enrollInCourse(
    userId: string,
    courseId: string,
    religion: Religion,
  ): Promise<IServiceResponse<CourseEnrollmentResponseDto>> {
    const course = await this.prismaService.course.findUnique({
      where: { id: courseId, religion },
      include: { lessons: true },
    });

    if (!course) {
      return {
        message: 'Course not found',
        success: false,
      };
    }

    const existingEnrollment =
      await this.prismaService.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

    if (existingEnrollment) {
      return {
        message: 'Already enrolled in this course',
        success: false,
      };
    }

    const enrollment = await this.prismaService.$transaction(async (tx) => {
      // Create enrollment
      const enrollment = await tx.courseEnrollment.create({
        data: {
          userId,
          courseId,
          status: 'ENROLLED',
          progress: 0,
          // Create progress records for all lessons
          lessonProgress: {
            createMany: {
              data: course.lessons.map((lesson) => ({
                lessonId: lesson.id,
                status: 'NOT_STARTED',
              })),
            },
          },
        },
        select: {
          id: true,
          courseId: true,
          userId: true,
          status: true,
          startedAt: true,
          completedAt: true,
          lastAccessedAt: true,
          progress: true,
        },
      });

      return enrollment;
    });

    return {
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment,
    };
  }

  async dropCourseEnrollment(
    userId: string,
    courseId: string,
    preserveHistory = false,
  ): Promise<IServiceResponse> {
    // Check if enrollment exists
    const enrollment = await this.prismaService.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return {
        message: 'Enrollment not found',
        success: false,
      };
    }

    return this.prismaService.$transaction(async (tx) => {
      if (!preserveHistory) {
        // Delete all lesson progress records
        await tx.courseLessonProgress.deleteMany({
          where: {
            enrollmentId: enrollment.id,
          },
        });
      }

      // Update enrollment status to DROPPED
      const updatedEnrollment = await tx.courseEnrollment.update({
        where: {
          id: enrollment.id,
        },
        data: {
          status: 'DROPPED',
          completedAt: null,
          // If not preserving history, reset progress
          ...(preserveHistory ? {} : { progress: 0 }),
        },
        select: {
          id: true,
          courseId: true,
          userId: true,
          status: true,
          startedAt: true,
          completedAt: true,
          lastAccessedAt: true,
          progress: true,
          lessonProgress: preserveHistory, // Only include if preserving history
        },
      });

      return {
        success: true,
        message: 'Successfully dropped course enrollment',
        data: updatedEnrollment,
      };
    });
  }

  async getEnrollmentDetails(
    userId: string,
    courseId: string,
  ): Promise<IServiceResponse> {
    const enrollment = await this.prismaService.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          select: {
            name: true,
            description: true,
            imageObjectKey: true,
            duration: true,
            lessons: {
              select: {
                id: true,
                name: true,
                ordering: true,
              },
            },
          },
        },
        lessonProgress: {
          orderBy: {
            lesson: {
              ordering: 'asc',
            },
          },
          include: {
            lesson: {
              select: {
                name: true,
                ordering: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return {
        message: 'Enrollment not found',
        success: false,
      };
    }

    // Transform the data to include lesson details with progress
    const lessonsWithProgress = enrollment.course.lessons.map((lesson) => {
      const progress = enrollment.lessonProgress.find(
        (progress) => progress.lessonId === lesson.id,
      );

      return {
        lessonId: lesson.id,
        name: lesson.name,
        ordering: lesson.ordering,
        status: progress?.status || 'NOT_STARTED',
        startedAt: progress?.startedAt,
        completedAt: progress?.completedAt,
        lastAccessedAt: progress?.lastAccessedAt,
      };
    });

    // sort lessons with progress by ordering
    lessonsWithProgress.sort((a, b) => a.ordering - b.ordering);

    const enrollmentDetails: CourseEnrollmentDetailsResponseDto = {
      id: enrollment.id,
      courseId: enrollment.courseId,
      courseName: enrollment.course.name,
      courseDescription: enrollment.course.description,
      courseImageUrl: getS3FileUrl(enrollment.course.imageObjectKey),
      courseDuration: enrollment.course.duration,
      enrollmentStatus: enrollment.status,
      progress: enrollment.progress,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      lessons: lessonsWithProgress,
    };

    return {
      success: true,
      message: 'Successfully retrieved course enrollment details',
      data: enrollmentDetails,
    };
  }

  async getUserEnrollments(
    userId: string,
    query: GetEnrollmentsQueryDto,
  ): Promise<IServiceResponse<PageDto<CourseEnrollmentSummaryResponseDto>>> {
    const whereClause = {
      userId,
      ...(query.status && { status: query.status }),
    };

    const [enrollments, total] = await Promise.all([
      this.prismaService.courseEnrollment.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.pageSize,
        orderBy: {
          lastAccessedAt: query.order,
        },
        include: {
          course: {
            select: {
              name: true,
              description: true,
              imageObjectKey: true,
              duration: true,
              isFree: true,
              author: {
                select: {
                  name: true,
                },
              },
              category: {
                select: {
                  name: true,
                },
              },
              courseTopic: {
                select: {
                  name: true,
                },
              },
            },
          },
          lessonProgress: {
            select: {
              status: true,
            },
          },
        },
      }),
      this.prismaService.courseEnrollment.count({ where: whereClause }),
    ]);

    // Transform the data to include summary information
    const transformedEnrollments: CourseEnrollmentSummaryResponseDto[] =
      enrollments.map((enrollment) => ({
        id: enrollment.id,
        courseId: enrollment.courseId,
        courseName: enrollment.course.name,
        courseDescription: enrollment.course.description,
        courseImageUrl: getS3FileUrl(enrollment.course.imageObjectKey),
        courseDuration: enrollment.course.duration,
        courseAuthorName: enrollment.course.author?.name,
        courseCategoryName: enrollment.course.category.name,
        courseTopicName: enrollment.course.courseTopic.name,
        isFree: enrollment.course.isFree,
        status: enrollment.status,
        progress: enrollment.progress,
        startedAt: enrollment.startedAt,
        completedAt: enrollment.completedAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        lessonsSummary: {
          total: enrollment.lessonProgress.length,
          completed: enrollment.lessonProgress.filter(
            (lp) => lp.status === 'COMPLETED',
          ).length,
          inProgress: enrollment.lessonProgress.filter(
            (lp) => lp.status === 'IN_PROGRESS',
          ).length,
        },
      }));

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: query,
      itemCount: total,
    });

    return {
      success: true,
      message: 'User enrollments retrieved successfully',
      data: new PageDto(transformedEnrollments, pageMetaDto),
    };
  }

  async getCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<IServiceResponse<CourseProgressReportDto>> {
    const enrollment = await this.prismaService.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          select: {
            name: true,
            lessons: {
              select: {
                id: true,
                name: true,
                ordering: true,
              },
              orderBy: {
                ordering: 'asc',
              },
            },
          },
        },
        lessonProgress: {
          include: {
            lesson: {
              select: {
                name: true,
                ordering: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return {
        message: 'Enrollment not found',
        success: false,
      };
    }

    // Calculate lesson progress details
    const lessonProgress = enrollment.course.lessons.map((lesson) => {
      const progress = enrollment.lessonProgress.find(
        (p) => p.lessonId === lesson.id,
      );

      // Calculate time spent (difference between lastAccessedAt and startedAt)
      const timeSpentMinutes =
        progress?.startedAt && progress?.lastAccessedAt
          ? Math.round(
              (progress.lastAccessedAt.getTime() -
                progress.startedAt.getTime()) /
                (1000 * 60),
            )
          : 0;

      const progressDetail: CourseLessonProgressDetailDto = {
        lessonId: lesson.id,
        name: lesson.name,
        ordering: lesson.ordering,
        status: progress?.status || 'NOT_STARTED',
        startedAt: progress?.startedAt,
        completedAt: progress?.completedAt,
        lastAccessedAt: progress?.lastAccessedAt,
        timeSpentMinutes,
      };

      return progressDetail;
    });

    // Calculate progress statistics
    const stats: ProgressStatsDto = {
      totalLessons: lessonProgress.length,
      completedLessons: lessonProgress.filter((l) => l.status === 'COMPLETED')
        .length,
      inProgressLessons: lessonProgress.filter(
        (l) => l.status === 'IN_PROGRESS',
      ).length,
      notStartedLessons: lessonProgress.filter(
        (l) => l.status === 'NOT_STARTED',
      ).length,
      overallProgress: enrollment.progress.toNumber(),
    };

    const courseProgressReport: CourseProgressReportDto = {
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      courseName: enrollment.course.name,
      status: enrollment.status,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      stats,
      lessonProgress,
    };

    return {
      success: true,
      message: 'Course progress report retrieved successfully',
      data: courseProgressReport,
    };
  }

  async startLesson(
    userId: string,
    courseId: string,
    lessonId: string,
  ): Promise<IServiceResponse<CourseLessonProgressResponseDto>> {
    // First, verify enrollment exists and get enrollmentId
    const enrollment = await this.prismaService.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!enrollment) {
      return {
        message: 'Enrollment not found',
        success: false,
      };
    }

    // Verify lesson belongs to the course
    const lessonBelongsToCourse = enrollment.course.lessons.some(
      (lesson) => lesson.id === lessonId,
    );
    if (!lessonBelongsToCourse) {
      return {
        success: false,
        message: 'Lesson not found in this course',
        status: HttpStatus.NOT_FOUND,
      };
    }

    // Get or create lesson progress
    const existingProgress =
      await this.prismaService.courseLessonProgress.findUnique({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId,
          },
        },
      });

    if (existingProgress?.status === 'COMPLETED') {
      return {
        success: false,
        message: 'Lesson is already completed',
        status: HttpStatus.CONFLICT,
      };
    }

    // Start the lesson or update last accessed time
    const now = new Date();
    const lessonProgress = await this.prismaService.$transaction(async (tx) => {
      // Update or create lesson progress
      const progress = await tx.courseLessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId,
          },
        },
        create: {
          enrollmentId: enrollment.id,
          lessonId,
          status: 'IN_PROGRESS',
          startedAt: now,
          lastAccessedAt: now,
        },
        update: {
          status: 'IN_PROGRESS',
          startedAt: existingProgress?.startedAt ?? now,
          lastAccessedAt: now,
        },
      });

      // Calculate and update overall course progress
      const allLessonProgress = await tx.courseLessonProgress.findMany({
        where: {
          enrollmentId: enrollment.id,
        },
      });

      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = allLessonProgress.filter(
        (p) => p.status === 'COMPLETED',
      ).length;
      const inProgressLessons = allLessonProgress.filter(
        (p) => p.status === 'IN_PROGRESS',
      ).length;

      // Calculate progress percentage (completed lessons + half credit for in-progress)
      const progressPercentage =
        ((completedLessons + inProgressLessons * 0.5) / totalLessons) * 100;

      // Update enrollment progress and status
      await tx.courseEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: 'IN_PROGRESS',
          progress: progressPercentage,
          lastAccessedAt: now,
        },
      });

      return progress;
    });

    const response: CourseLessonProgressResponseDto = {
      lessonId: lessonProgress.lessonId,
      status: lessonProgress.status,
      startedAt: lessonProgress.startedAt!,
      completedAt: null,
      lastAccessedAt: lessonProgress.lastAccessedAt!,
    };

    return {
      success: true,
      message: 'Lesson started successfully',
      data: response,
    };
  }
  async completeLesson(
    userId: string,
    courseId: string,
    lessonId: string,
  ): Promise<IServiceResponse<LessonCompletionResponseDto>> {
    // First, verify enrollment and lesson exist
    const enrollment = await this.prismaService.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: {
                ordering: 'asc',
              },
            },
          },
        },
        lessonProgress: true,
      },
    });

    if (!enrollment) {
      return {
        success: false,
        message: 'Course enrollment not found',
        status: HttpStatus.NOT_FOUND,
      };
    }

    // Verify lesson belongs to the course
    const lessonIndex = enrollment.course.lessons.findIndex(
      (lesson) => lesson.id === lessonId,
    );
    if (lessonIndex === -1) {
      return {
        success: false,
        message: 'Lesson not found in this course',
        status: HttpStatus.NOT_FOUND,
      };
    }

    // Get existing lesson progress
    const existingProgress = enrollment.lessonProgress.find(
      (progress) => progress.lessonId === lessonId,
    );

    if (!existingProgress || existingProgress.status === 'NOT_STARTED') {
      return {
        success: false,
        message: 'Lesson must be started before completion',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    if (existingProgress.status === 'COMPLETED') {
      return {
        success: false,
        message: 'Lesson is already completed',
        status: HttpStatus.CONFLICT,
      };
    }

    const now = new Date();

    const lessonProgress = await this.prismaService.$transaction(async (tx) => {
      // Update lesson progress
      const updatedProgress = await tx.courseLessonProgress.update({
        where: {
          id: existingProgress.id,
        },
        data: {
          status: 'COMPLETED',
          completedAt: now,
          lastAccessedAt: now,
        },
      });

      // Calculate new course progress
      const allLessonProgress = await tx.courseLessonProgress.findMany({
        where: {
          enrollmentId: enrollment.id,
        },
      });

      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = allLessonProgress.filter(
        (p) => p.status === 'COMPLETED',
      ).length;
      const inProgressLessons = allLessonProgress.filter(
        (p) => p.status === 'IN_PROGRESS',
      ).length;

      // Calculate progress percentage
      const progressPercentage =
        ((completedLessons + inProgressLessons * 0.5) / totalLessons) * 100;

      // Check if this was the last lesson
      const isAllLessonsCompleted = completedLessons === totalLessons;

      // Update enrollment status and progress
      const updatedEnrollment = await tx.courseEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: isAllLessonsCompleted ? 'COMPLETED' : 'IN_PROGRESS',
          progress: progressPercentage,
          lastAccessedAt: now,
          completedAt: isAllLessonsCompleted ? now : null,
        },
      });

      // Calculate time spent on the lesson
      const timeSpentMinutes = Math.round(
        (now.getTime() - existingProgress.startedAt!.getTime()) / (1000 * 60),
      );

      const isLastLesson = lessonIndex === enrollment.course.lessons.length - 1;

      const progress: LessonCompletionResponseDto = {
        lessonId: updatedProgress.lessonId,
        status: updatedProgress.status,
        startedAt: updatedProgress.startedAt!,
        completedAt: updatedProgress.completedAt!,
        timeSpentMinutes,
        courseStatus: updatedEnrollment.status,
        courseProgress: Number(updatedEnrollment.progress.toFixed(2)),
        isLastLesson,
      };
      return progress;
    });

    return {
      success: true,
      message: 'Lesson completed successfully',
      data: lessonProgress,
    };
  }

  async getLessonDetails(
    userId: string,
    courseId: string,
    lessonId: string,
  ): Promise<IServiceResponse<CourseLessonDetailsResponseDto>> {
    // First, verify enrollment and lesson exist
    const enrollment = await this.prismaService.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: {
                ordering: 'asc',
              },
            },
          },
        },
        lessonProgress: true,
      },
    });

    if (!enrollment) {
      return {
        success: false,
        message: 'Course enrollment not found',
        status: HttpStatus.NOT_FOUND,
      };
    }

    // Verify lesson belongs to the course
    const lessonIndex = enrollment.course.lessons.findIndex(
      (lesson) => lesson.id === lessonId,
    );
    if (lessonIndex === -1) {
      return {
        success: false,
        message: 'Lesson not found in this course',
        status: HttpStatus.NOT_FOUND,
      };
    }

    // Get existing lesson progress
    const existingProgress = enrollment.lessonProgress.find(
      (progress) => progress.lessonId === lessonId,
    );

    const lesson = enrollment.course.lessons[lessonIndex];

    const response: CourseLessonDetailsResponseDto = {
      name: lesson.name,
      content: lesson.content,
      lessonId: lesson.id,
      status: existingProgress?.status,
      startedAt: existingProgress?.startedAt,
      completedAt: existingProgress?.completedAt,
      lastAccessedAt: existingProgress?.lastAccessedAt,
    };

    return {
      success: true,
      message: 'Lesson details retrieved successfully',
      data: response,
    };
  }
}
