import { BadRequestException, Injectable } from '@nestjs/common';
import { Course, Prisma, Religion } from '@prisma/client';
import slugify from 'slugify';
import {
  AdminCoursePaginatedResponseDto,
  AdminCourseResponseDto,
  AdminCreateCourseDto,
  CourseCategoryResponseDto,
  CourseResponseDto,
  IServiceResponse,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
  ReligionEnum,
} from 'src/common';
import { SortFilterDto } from 'src/common/dto/filters';
import { PrismaService } from 'src/common/services/database/prisma';
import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';
import { CourseEntity } from 'src/shared/database/prisma/generated/course.entity';
import { CreateCourseLessonDto } from 'src/shared/database/prisma/generated/create-courseLesson.dto';

@Injectable()
export class CoursesAdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  private generateCourseMediaS3Key(
    filename: string,
    courseName: string,
    categoryName: string,
    religionCode: string,
    mediaType: 'video' | 'image' = 'image',
  ): string {
    const file_name = filename.split('.')[0];
    const file_ext = filename.split('.').pop();
    const _filename = `${mediaType === 'image' ? `IMG-${Date.now()}` : `${file_name}`}.${file_ext}`;
    return `courses/${religionCode}/${categoryName.toLowerCase()}/${slugify(courseName.toLowerCase())}/${_filename}`;
  }

  async getCourses(
    pageOptionsDto: PageOptionsDto,
    sortDto: SortFilterDto,
  ): Promise<IServiceResponse<AdminCoursePaginatedResponseDto>> {
    const religionFilter = sortDto.religion;
    let religion: Religion | undefined = undefined;
    if (religionFilter) {
      religion = await this.prismaService.religion.findFirst({
        where: { code: religionFilter },
      });
    }

    const whereClause = religion
      ? {
          religionId: religion?.id,
        }
      : {};

    const courses = await this.prismaService.course.findMany({
      where: whereClause,
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.pageSize,
      orderBy: {
        createdAt: pageOptionsDto.order,
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        imageObjectKey: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    const coursesResponseDtos = courses.map((course) => {
      return new AdminCourseResponseDto(course as CourseEntity);
    });

    const itemCount = await this.prismaService.course.count({
      where: whereClause,
    });
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return {
      data: new PageDto(coursesResponseDtos, pageMetaDto),
      success: true,
      message: 'Courses fetched successfully',
    };
  }

  async createCourse(
    createCourseDto: AdminCreateCourseDto,
    image: Express.Multer.File,
  ): Promise<IServiceResponse<AdminCourseResponseDto>> {
    const courseCategory = await this.prismaService.courseCategory.findUnique({
      where: {
        id: createCourseDto.categoryId,
      },
      select: {
        name: true,
        religion: {
          select: {
            id: true,
            code: true,
          },
        },
      },
    });

    const religion = courseCategory.religion;

    if (!courseCategory) {
      throw new BadRequestException('Course category not found');
    }

    const imageS3Key = this.generateCourseMediaS3Key(
      image.originalname,
      createCourseDto.name,
      courseCategory.name,
      religion.code === ReligionEnum.CHRISTIANITY ? 'christian' : 'islam',
      'image',
    );
    const imageUpload = await this.s3StorageService.uploadFile(
      image,
      imageS3Key,
    );

    // Create course topic
    const courseTopic = await this.prismaService.courseTopic.create({
      data: {
        name: createCourseDto.name,
        courseCategoryId: createCourseDto.categoryId,
        code: slugify(createCourseDto.name.toLowerCase()),
        religionId: religion.id,
      },
    });

    let parsedLessons;
    try {
      parsedLessons = Array.isArray(createCourseDto.lessons)
        ? createCourseDto.lessons
        : JSON.parse(`[${createCourseDto.lessons}]`);
    } catch (e) {
      throw new BadRequestException(
        'Invalid lessons format. Expected JSON array.',
      );
    }

    const courseLessons: CreateCourseLessonDto[] = parsedLessons.map(
      (lesson) => {
        return {
          name: lesson.name,
          content: lesson.content,
          ordering:
            typeof lesson.ordering === 'string'
              ? parseInt(lesson.ordering)
              : lesson.ordering,
        };
      },
    );

    const course = await this.prismaService.course.create({
      data: {
        name: createCourseDto.name,
        description: createCourseDto.description,
        lessons: {
          create: courseLessons,
        },
        categoryId: createCourseDto.categoryId as string,
        courseTopicId: courseTopic.id,
        imageObjectKey: imageUpload.Key,
        religionId: religion.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        imageObjectKey: true,
      },
    });

    return {
      data: new AdminCourseResponseDto(course as CourseEntity),
      success: true,
      message: 'Course created successfully',
    };
  }

  async getCourseCategories(): Promise<
    IServiceResponse<CourseCategoryResponseDto[]>
  > {
    const categories = await this.prismaService.courseCategory.findMany({
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

  async searchCourses(
    query: string,
  ): Promise<IServiceResponse<CourseResponseDto[]>> {
    const searchKeywords = query.trim().split(' ').join(' | ');

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
    "createdAt"
     FROM "Course" WHERE
    to_tsvector('english', "description") @@ to_tsquery(${searchKeywords})
    OR to_tsvector('english', "name") @@ to_tsquery(${searchKeywords})
    OR "Course"."name" ILIKE '%' || ${searchKeywords} || '%'
    OR "Course"."description" ILIKE '%' || ${searchKeywords} || '%';`,
    );

    const coursesResponseDtos = courses.map(
      (course) => new CourseResponseDto(course),
    );

    return {
      success: true,
      message: 'All courses fetched successfully',
      data: coursesResponseDtos,
    };
  }
}
