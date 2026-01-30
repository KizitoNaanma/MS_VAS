import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminCoursePaginatedResponseDto,
  AdminCreateCourseDto,
  ApiErrorDecorator,
  AuthorizationRequired,
  CourseCategoryResponseDto,
  CourseResponseDto,
  PageOptionsDto,
  RequiresAdminRole,
} from 'src/common';
import { ResponseUtilsService } from 'src/modules/utils';
import { CoursesAdminService } from './courses.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { SortFilterDto } from 'src/common/dto/filters';

@ApiBearerAuth()
@ApiTags('Courses-admin')
@Controller('admin/courses')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@AuthorizationRequired()
@RequiresAdminRole()
export class CoursesAdminController {
  constructor(
    private readonly response: ResponseUtilsService,
    private readonly coursesAdminService: CoursesAdminService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get courses' })
  @ApiOkResponse({
    description: 'Courses fetched successfully',
    type: AdminCoursePaginatedResponseDto,
  })
  async getCourses(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() sortDto: SortFilterDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.coursesAdminService.getCourses(
      pageOptionsDto,
      sortDto,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post()
  @ApiOperation({ summary: 'Create course' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOkResponse({
    description: 'Course created successfully',
  })
  async createCourse(
    @Body() createCourseDto: AdminCreateCourseDto,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.coursesAdminService.createCourse(
      createCourseDto,
      image,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get course categories' })
  @ApiOkResponse({
    description: 'Course categories fetched successfully',
    type: [CourseCategoryResponseDto],
  })
  async getAllCourseCategories(@Res() res: Response) {
    const serviceResponse =
      await this.coursesAdminService.getCourseCategories();
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search courses' })
  @ApiOkResponse({
    description: 'Courses fetched successfully',
    type: [CourseResponseDto],
  })
  async searchCourses(@Query('query') query: string, @Res() res: Response) {
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
    const serviceResponse = await this.coursesAdminService.searchCourses(query);
    return this.response.sendResponse(res, serviceResponse);
  }
}
