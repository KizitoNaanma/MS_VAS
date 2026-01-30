import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { BibleService } from './bible.service';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  GetBibleBooksDtoResponse,
  GetBibleChapterDtoResponse,
  GetBibleVerseDtoResponse,
  GetBibleVersionsDtoResponse,
  GetChapterDto,
  GetChapterVerseCountDto,
  GetChapterVerseCountDtoResponse,
  GetVerseDto,
  IGetChapter,
  IGetVerse,
  IResponse,
  ReligionMustMatch,
  SubscriptionRequired,
} from 'src/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Bible')
@Controller('bible')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@ReligionMustMatch()
@SubscriptionRequired()
@AuthorizationRequired()
export class BibleController {
  constructor(private readonly services: BibleService) {}

  @ApiOperation({ summary: 'Get bible versions' })
  @ApiOkResponse({
    description: 'Get bible versions successful',
    type: GetBibleVersionsDtoResponse,
  })
  @Get('/versions')
  async getVersions(@Res() res: Response) {
    const response: IResponse = await this.services.getVersions();
    const { status, ...rest } = response;
    return res.status(status).json(rest);
  }

  @ApiOperation({ summary: 'Get bible books' })
  @ApiOkResponse({
    description: 'Get bible books successful',
    type: GetBibleBooksDtoResponse,
  })
  @Get('/books')
  async getBooks(@Res() res: Response) {
    const response: IResponse = await this.services.getBooks();
    const { status, ...rest } = response;
    return res.status(status).json(rest);
  }

  @ApiOperation({ summary: 'Get bible chapter' })
  @ApiOkResponse({
    description: 'Get bible chapter successful',
    type: GetBibleChapterDtoResponse,
  })
  @ApiQuery({ name: 'versionId', type: String })
  @ApiQuery({ name: 'bookId', type: String })
  @ApiQuery({ name: 'chapterId', type: String })
  @Get('/chapter')
  async getChapter(@Query() query: GetChapterDto, @Res() res: Response) {
    const payload: IGetChapter = query;
    const response: IResponse = await this.services.getChapter(payload);
    const { status, ...rest } = response;
    return res.status(status).json(rest);
  }

  @ApiOperation({ summary: 'Get chapter verse count' })
  @ApiOkResponse({
    description: 'Get chapter verse count successful',
    type: GetChapterVerseCountDtoResponse,
  })
  @ApiQuery({ name: 'bookId', type: String })
  @ApiQuery({ name: 'chapterId', type: String })
  @Get('/verse-count')
  async getChapterVerseCount(
    @Query() query: GetChapterVerseCountDto,
    @Res() res: Response,
  ) {
    const response: IResponse = await this.services.getChapterVerseCount(
      parseInt(query.bookId),
      parseInt(query.chapterId),
    );
    const { status, ...rest } = response;
    return res.status(status).json(rest);
  }

  @ApiOperation({ summary: 'Get bible verse' })
  @ApiOkResponse({
    description: 'Get bible verse successful',
    type: GetBibleVerseDtoResponse,
  })
  @ApiQuery({ name: 'versionId', type: String })
  @ApiQuery({ name: 'bookId', type: String })
  @ApiQuery({ name: 'chapterId', type: String })
  @ApiQuery({ name: 'verseId', type: String })
  @Get('/verse')
  async getVerse(@Query() query: GetVerseDto, @Res() res: Response) {
    const payload: IGetVerse = query;
    const response: IResponse = await this.services.getVerse(payload);
    const { status, ...rest } = response;
    return res.status(status).json(rest);
  }
}
