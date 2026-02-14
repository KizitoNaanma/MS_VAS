import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { MindfulnessResourceService } from './mindfulness-resource.service';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  SubscriptionRequired,
} from 'src/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserReligionInterceptor } from 'src/common/interceptors/current-user-religion.interceptor';
import {
  MindfulnessResourceCategoryResponseDto,
  MindfulnessResourceResponseDto,
} from 'src/common/dto/mindfulness-resource';
import { CurrentUserReligion } from 'src/common/decorators/current-user-religion.decorator';
import { Religion } from '@prisma/client';
import { ResponseUtilsService } from '../utils';
import { Response } from 'express';
import { SubscriptionAccessInterceptor } from 'src/common/interceptors/subscription-access.interceptor';

@ApiBearerAuth()
@ApiTags('Mindfulness-resources')
@Controller('mindfulness-resources')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@SubscriptionRequired()
@AuthorizationRequired()
@UseInterceptors(CurrentUserReligionInterceptor)
@UseInterceptors(SubscriptionAccessInterceptor)
export class MindfulnessResourceController {
  constructor(
    private readonly resourceService: MindfulnessResourceService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get mindfulness resource categories' })
  @ApiOkResponse({
    description: 'Mindfulness resource categories fetched successfully',
    type: MindfulnessResourceCategoryResponseDto,
  })
  async getCategories(
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.resourceService.getCategories(religion);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search mindfulness resources' })
  @ApiOkResponse({
    description: 'Mindfulness resources fetched successfully',
    type: [MindfulnessResourceResponseDto],
  })
  async searchMindfulnessResources(
    @Query('query') query: string,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.resourceService.searchMindfulnessResources(query, religion);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':categoryId')
  @ApiOperation({ summary: 'Get mindfulness resources by category' })
  @ApiOkResponse({
    description: 'Mindfulness resources fetched successfully',
    type: [MindfulnessResourceResponseDto],
  })
  async getResourcesByCategory(
    @Param('categoryId') categoryId: string,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.resourceService.getResourcesByCategory(
      categoryId,
      religion,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':categoryId/:resourceId')
  @ApiOperation({ summary: 'Get mindfulness resource by id' })
  @ApiOkResponse({
    description: 'Mindfulness resource fetched successfully',
    type: MindfulnessResourceResponseDto,
  })
  async getResourceById(
    @Param('categoryId') categoryId: string,
    @Param('resourceId') resourceId: string,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.resourceService.getResourceById(
      categoryId,
      resourceId,
      religion,
    );
    return this.response.sendResponse(res, serviceResponse);
  }
}
