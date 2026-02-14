import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { QuranService } from './quran.service';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  GetSurahDtoResponse,
  GetSurahsDtoResponse,
  IResponse,
  SubscriptionRequired,
} from 'src/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Quran')
@Controller('quran')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@SubscriptionRequired()
@AuthorizationRequired()
export class QuranController {
  constructor(private readonly services: QuranService) {}

  @Get('/surahs')
  @ApiOperation({ summary: 'Get surahs' })
  @ApiOkResponse({
    description: 'Get surahs successful',
    type: GetSurahsDtoResponse,
  })
  async getBooks(@Res() res: Response) {
    const response: IResponse = await this.services.getSurahs();
    const { status, ...rest } = response;
    return res.status(status).json(rest);
  }

  @Get('/surah/:surahName')
  @ApiOperation({ summary: 'Get surah' })
  @ApiOkResponse({
    description: 'Get surah successful',
    type: GetSurahDtoResponse,
  })
  async getChapter(
    @Param('surahName') surahName: string,
    @Res() res: Response,
  ) {
    const response: IResponse = await this.services.getSurah(surahName);
    const { status, ...rest } = response;
    return res.status(status).json(rest);
  }
}
