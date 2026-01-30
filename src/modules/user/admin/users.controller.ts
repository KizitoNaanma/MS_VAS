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
} from '@nestjs/common';
import { AdminUsersService } from './users.service';
import { UpdateUserDto } from 'src/shared/database/prisma/generated/update-user.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminRoleResponseDto,
  AdminUserPaginatedResponseDto,
  AdminUserResponseDto,
  ApiErrorDecorator,
  AuthorizationRequired,
  CreateAdminUserDto,
  PageOptionsDto,
  RequiresAdminRole,
  StandardUserPaginatedResponseDto,
  StandardUserResponseDto,
  UsersStatisticsResponseDto,
  UserWithSubscriptionResponseDto,
} from 'src/common';
import { ResponseUtilsService } from 'src/modules/utils';
import { Response } from 'express';
import { FilterDto } from 'src/common/dto/filters';

@ApiBearerAuth()
@ApiTags('Users-admin')
@Controller('admin/users')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@AuthorizationRequired()
@RequiresAdminRole()
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({
    description: 'Users fetched successfully',
    type: StandardUserPaginatedResponseDto,
  })
  async getAllUsers(
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
    @Query() filterDto: FilterDto,
  ) {
    const serviceResponse = await this.adminUsersService.getAllUsers(
      pageOptionsDto,
      filterDto,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get statistics' })
  @ApiOkResponse({
    description: 'Statistics fetched successfully',
    type: UsersStatisticsResponseDto,
  })
  async getStatistics(@Res() res: Response) {
    const serviceResponse = await this.adminUsersService.getUsersStatistics();
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiOkResponse({
    description: 'Admin users fetched successfully',
    type: AdminUserPaginatedResponseDto,
  })
  async getAdminUsers(
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.adminUsersService.getAdminUsers(pageOptionsDto);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('admin/get-roles')
  @ApiOperation({ summary: 'Get all admin roles' })
  @ApiOkResponse({
    description: 'Admin roles fetched successfully',
    type: AdminRoleResponseDto,
  })
  async getAdminRoles(@Res() res: Response) {
    const serviceResponse = await this.adminUsersService.getAdminRoles();
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('admin/:userId')
  @ApiOperation({ summary: 'Get admin user details' })
  @ApiOkResponse({
    description: 'Admin user details fetched successfully',
    type: AdminUserResponseDto,
  })
  async getAdminUserDetails(
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.adminUsersService.getAdminUserDetails(userId);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post('admin/create')
  @ApiOperation({ summary: 'Create admin user' })
  @ApiOkResponse({
    description: 'Admin user created successfully',
  })
  async createAdminUser(
    @Body() createAdminUserDto: CreateAdminUserDto,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.adminUsersService.createAdminUser(createAdminUserDto);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch('admin/:id/suspend')
  @ApiOperation({ summary: 'Suspend admin user' })
  @ApiOkResponse({
    description: 'Admin user suspended successfully',
  })
  async suspendAdminUser(@Param('id') id: string, @Res() res: Response) {
    const serviceResponse = await this.adminUsersService.suspendAdminUser(id);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch('admin/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate admin user' })
  @ApiOkResponse({
    description: 'Admin user reactivated successfully',
  })
  async reactivateAdminUser(@Param('id') id: string, @Res() res: Response) {
    const serviceResponse =
      await this.adminUsersService.reactivateAdminUser(id);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user details with recent subscription information',
  })
  @ApiOkResponse({
    description: 'User details fetched successfully',
    type: UserWithSubscriptionResponseDto,
  })
  async getUserDetails(@Param('id') id: string, @Res() res: Response) {
    const serviceResponse = await this.adminUsersService.getUserById(id);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiOkResponse({
    description: 'User profile updated successfully',
    type: StandardUserResponseDto,
  })
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.adminUsersService.updateUser(
      id,
      updateUserDto,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiOkResponse({
    description: 'User deactivated successfully',
  })
  async deactivateUser(@Param('id') id: string, @Res() res: Response) {
    const serviceResponse = await this.adminUsersService.deactivateUser(id);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiOkResponse({
    description: 'User activated successfully',
  })
  async activateUser(@Param('id') id: string, @Res() res: Response) {
    const serviceResponse = await this.adminUsersService.activateUser(id);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse({
    description: 'User deleted successfully',
  })
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    const serviceResponse = await this.adminUsersService.deleteUser(id);
    return this.response.sendResponse(res, serviceResponse);
  }
}
