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
import { JournalService } from './journal.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResponseUtilsService } from 'src/modules/utils';
import { JournalDto } from 'src/shared/database/prisma/generated/journal.dto';
import { CreateJournalDto } from 'src/shared/database/prisma/generated/create-journal.dto';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  CurrentUser,
  ReligionMustMatch,
  SubscriptionRequired,
} from 'src/common';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { UpdateJournalDto } from 'src/shared/database/prisma/generated/update-journal.dto';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Journals')
@Controller('journals')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@ReligionMustMatch()
@SubscriptionRequired()
@AuthorizationRequired()
export class JournalController {
  constructor(
    private readonly journalService: JournalService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user journals' })
  @ApiOkResponse({
    description: 'Journals fetched successfully',
    type: [JournalDto],
  })
  async getJournals(@CurrentUser() user: UserEntity, @Res() res: Response) {
    const serviceResponse = await this.journalService.getJournals(user.id);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search user journals' })
  @ApiOkResponse({
    description: 'Journals fetched successfully',
    type: [JournalDto],
  })
  async searchJournals(
    @CurrentUser() user: UserEntity,
    @Query('query') searchQuery: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.journalService.searchUserJournals(
      user,
      searchQuery,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get single user journal by id' })
  @ApiOkResponse({
    description: 'Journal fetched successfully',
    type: JournalDto,
  })
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Journal not found')
  async getJournal(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.journalService.getJournal(user.id, id);
    return this.response.sendResponse(res, serviceResponse, {
      errorResponseFn: 'error404Response',
    });
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update user journal' })
  @ApiOkResponse({
    description: 'Journal updated successfully',
    type: JournalDto,
  })
  async updateJournal(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() data: UpdateJournalDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.journalService.updateJournal(
      id,
      user,
      data,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete user journal' })
  @ApiOkResponse({
    description: 'Journal deleted successfully',
    type: JournalDto,
  })
  async deleteJournal(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.journalService.deleteJournal(id, user);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post()
  @ApiOperation({ summary: 'Create user journal' })
  @ApiOkResponse({
    description: 'Journal created successfully',
    type: JournalDto,
  })
  @ApiErrorDecorator(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'Failed to create journal',
  )
  async createJournal(
    @CurrentUser() user: UserEntity,
    @Body() data: CreateJournalDto,
    @Res() res: Response,
  ) {
    const payload = { ...data, createdById: user.id };
    const serviceResponse = await this.journalService.createJournal(payload);
    return this.response.sendResponse(res, serviceResponse);
  }
}
