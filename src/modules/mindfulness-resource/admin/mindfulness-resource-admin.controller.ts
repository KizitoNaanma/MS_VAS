import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
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
  ApiErrorDecorator,
  AuthorizationRequired,
  PageOptionsDto,
  RequiresAdminRole,
} from 'src/common';
import { MindfulnessResourcesAdminService } from './mindfulness-resource-admin.service';
import { ResponseUtilsService } from 'src/modules/utils';
import { Response } from 'express';
import {
  AdminCreateMindfulnessResourceDto,
  AdminMindfulnessResourceResponseDto,
  AdminUpdateMindfulnessResourceDto,
  MindfulnessResourceCategoryResponseDto,
  MindfulnessResourceResponseDto,
} from 'src/common/dto/mindfulness-resource';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('Mindfulness-resources-admin')
@Controller('admin/mindfulness-resources')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@AuthorizationRequired()
@RequiresAdminRole()
export class MindfulnessResourcesController {
  constructor(
    private readonly mindfulnessResourcesAdminService: MindfulnessResourcesAdminService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get mindfulness resources' })
  @ApiOkResponse({
    description: 'Mindfulness resources fetched successfully',
    type: [AdminMindfulnessResourceResponseDto],
  })
  async getMindfulnessResources(
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.mindfulnessResourcesAdminService.getMindfulnessResources(
        pageOptionsDto,
      );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get mindfulness resource categories' })
  @ApiOkResponse({
    description: 'Mindfulness resource categories fetched successfully',
    type: MindfulnessResourceCategoryResponseDto,
  })
  async getCategories(@Res() res: Response) {
    const serviceResponse =
      await this.mindfulnessResourcesAdminService.getCategories();
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search all mindfulness resources' })
  @ApiOkResponse({
    description: 'Mindfulness resources fetched successfully',
    type: [MindfulnessResourceResponseDto],
  })
  async searchMindfulnessResources(
    @Query('query') query: string,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.mindfulnessResourcesAdminService.searchAllMindfulnessResources(
        query,
      );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post()
  @ApiOperation({ summary: 'Create mindfulness resource' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ]),
  )
  @ApiOkResponse({
    description: 'Mindfulness resource created successfully',
    type: AdminMindfulnessResourceResponseDto,
  })
  async createMindfulnessResource(
    @Body() createMindfulnessResourceDto: AdminCreateMindfulnessResourceDto,
    @UploadedFiles()
    files: {
      audio?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.mindfulnessResourcesAdminService.createMindfulnessResource(
        createMindfulnessResourceDto,
        files.audio?.[0],
        files.image?.[0],
      );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update mindfulness resource' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ]),
  )
  async updateMindfulnessResource(
    @Param('id') id: string,
    @Body() updateMindfulnessResourceDto: AdminUpdateMindfulnessResourceDto,
    @UploadedFiles()
    files: {
      audio?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.mindfulnessResourcesAdminService.updateMindfulnessResource(
        id,
        updateMindfulnessResourceDto,
        files.audio?.[0],
        files.image?.[0],
      );

    return this.response.sendResponse(res, serviceResponse);
  }
}
