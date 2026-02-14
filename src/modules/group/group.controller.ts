import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
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
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  CurrentUser,
  CurrentUserReligion,
  PageOptionsDto,
  SubscriptionRequired,
} from 'src/common';
import { CurrentUserReligionInterceptor } from 'src/common/interceptors/current-user-religion.interceptor';
import { GroupService } from './group.service';
import { CreateGroupDto } from 'src/shared/database/prisma/generated/create-group.dto';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import {
  CreateMessageWithAttachmentsDto,
  GroupResponseDto,
  SimpleGroupResponseDto,
  SimpleMessageWithAttachmentsPaginatedResponseDto,
  SimpleMessageWithAttachmentsResponseDto,
} from 'src/common/dto/group';
import { ResponseUtilsService } from '../utils';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Religion } from '@prisma/client';
import { UpdateGroupDto } from 'src/shared/database/prisma/generated/update-group.dto';
import { ApiStandardSuccessDecorator } from 'src/common/decorators/api-standard-success.decorator';

@Controller('groups')
@ApiBearerAuth()
@ApiTags('Groups')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@SubscriptionRequired()
@AuthorizationRequired()
@UseInterceptors(CurrentUserReligionInterceptor)
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiOkResponse({
    description: 'Group created successfully',
    type: SimpleGroupResponseDto,
  })
  async createGroup(
    @Body() data: CreateGroupDto,
    @CurrentUser() user: UserEntity,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.groupService.createGroup(
      user,
      religion,
      data,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch(':groupId')
  @ApiOperation({ summary: 'Update a group' })
  @ApiStandardSuccessDecorator('Group updated successfully')
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'The id of the group to update',
  })
  async updateGroup(
    @Param('groupId') groupId: string,
    @Body() data: UpdateGroupDto,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.groupService.updateGroup(
      groupId,
      user,
      data,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  @ApiOkResponse({
    description: 'Groups fetched successfully',
    type: SimpleGroupResponseDto,
  })
  @ApiQuery({
    name: 'owner',
    required: false,
    enum: ['me', 'others'],
    description:
      'Filter groups by owner. "me" shows groups you own, "others" shows groups owned by others',
  })
  @ApiQuery({
    name: 'joined',
    required: false,
    description: 'Filter groups by whether you are a member',
    enum: ['true', 'false'],
  })
  async getGroups(
    @CurrentUser() user: UserEntity,
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
    @Query('owner') owner?: 'me' | 'others',
    @Query('joined') joined?: 'true' | 'false',
  ) {
    const serviceResponse = await this.groupService.getGroups(
      user,
      religion,
      owner,
      joined,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search groups' })
  @ApiOkResponse({
    description: 'Groups fetched successfully',
    type: [SimpleGroupResponseDto],
  })
  async searchGroups(
    @CurrentUserReligion() religion: Religion,
    @Query('query') query: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.groupService.searchGroups(
      religion,
      query,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':groupId')
  @ApiOperation({ summary: 'Get a group details by id' })
  @ApiOkResponse({
    description: 'Group details fetched successfully',
    type: GroupResponseDto,
  })
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'The id of the group to fetch',
  })
  async getGroup(@Param('groupId') groupId: string, @Res() res: Response) {
    const serviceResponse = await this.groupService.getGroup(groupId);

    return this.response.sendResponse(res, serviceResponse, {
      errorResponseFn: 'error404Response',
    });
  }

  @Post(':groupId/join')
  @ApiOperation({ summary: 'Join a group' })
  @ApiStandardSuccessDecorator('Group joined successfully')
  async joinGroup(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.groupService.joinGroup(groupId, userId);

    return this.response.sendResponse(res, serviceResponse);
  }

  @Delete(':groupId/leave')
  @ApiOperation({ summary: 'Leave a group' })
  @ApiStandardSuccessDecorator('Group left successfully')
  async leaveGroup(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.groupService.leaveGroup(groupId, userId);

    return this.response.sendResponse(res, serviceResponse);
  }

  @Delete(':groupId/members/:userId')
  @ApiOperation({ summary: 'Remove a member from a group' })
  @ApiStandardSuccessDecorator('Member removed successfully')
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'The id of the group to remove a member from',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'The id of the user to remove from the group',
  })
  async removeMemberFromGroup(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.groupService.removeMemberFromGroup(
      groupId,
      userId,
      user,
    );

    return this.response.sendResponse(res, serviceResponse);
  }

  //   Message
  @Post(':groupId/messages')
  @UseInterceptors(FilesInterceptor('attachments'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Send a message to a group with attachments' })
  @ApiOkResponse({
    description: 'Message sent successfully',
    type: SimpleMessageWithAttachmentsResponseDto,
  })
  async sendMessageToGroup(
    @Param('groupId') groupId: string,
    @Body() data: CreateMessageWithAttachmentsDto,
    @UploadedFiles() attachments: Express.Multer.File[],
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.groupService.sendMessageToGroup(
      groupId,
      user,
      data,
      attachments,
    );

    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':groupId/messages')
  @ApiOperation({ summary: 'Get messages of a group' })
  @ApiOkResponse({
    description: 'Messages fetched successfully',
    type: SimpleMessageWithAttachmentsPaginatedResponseDto,
  })
  async getMessagesOfGroup(
    @Param('groupId') groupId: string,
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.groupService.getMessagesOfGroup(
      groupId,
      pageOptionsDto,
    );

    return this.response.sendResponse(res, serviceResponse);
  }
}
