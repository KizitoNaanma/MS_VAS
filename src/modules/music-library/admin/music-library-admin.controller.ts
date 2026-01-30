import {
  BadRequestException,
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
import { MusicLibraryAdminService } from './music-library-admin.service';
import { ResponseUtilsService } from 'src/modules/utils';
import {
  AdminCreateTrackDto,
  AdminTrackResponseDto,
  AdminUpdateTrackDto,
  AlbumResponseDto,
  ArtistResponseDto,
  TrackResponseDto,
} from 'src/common/dto/music-library';
import { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('Music-library-admin')
@Controller('admin/music-library')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@AuthorizationRequired()
@RequiresAdminRole()
export class MusicLibraryAdminController {
  constructor(
    private readonly musicLibraryAdminService: MusicLibraryAdminService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('tracks')
  @ApiOperation({ summary: 'Get all tracks' })
  @ApiOkResponse({
    description: 'Tracks fetched successfully',
    type: AdminTrackResponseDto,
  })
  async getTracks(
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.musicLibraryAdminService.getTracks(pageOptionsDto);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('tracks/search')
  @ApiOperation({ summary: 'Search all tracks' })
  @ApiOkResponse({
    description: 'Tracks fetched successfully',
    type: [TrackResponseDto],
  })
  async searchAllTracks(@Query('query') query: string, @Res() res: Response) {
    const serviceResponse =
      await this.musicLibraryAdminService.searchAllTracks(query);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('artists')
  @ApiOperation({ summary: 'Get artists' })
  @ApiOkResponse({
    description: 'Artists fetched successfully',
    type: [ArtistResponseDto],
  })
  async getArtists(@Res() res: Response) {
    const serviceResponse = await this.musicLibraryAdminService.getArtists();
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('albums')
  @ApiOperation({ summary: 'Get albums' })
  @ApiOkResponse({
    description: 'Albums fetched successfully',
    type: [AlbumResponseDto],
  })
  async getAlbums(@Res() res: Response) {
    const serviceResponse = await this.musicLibraryAdminService.getAlbums();

    return this.response.sendResponse(res, serviceResponse);
  }

  @Post('tracks')
  @ApiOperation({ summary: 'Create a new track' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ]),
  )
  @ApiOkResponse({
    description: 'Track created successfully',
    type: AdminTrackResponseDto,
  })
  async createTrack(
    @Body() createTrackDto: AdminCreateTrackDto,
    @UploadedFiles()
    files: {
      audio?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Res() res: Response,
  ) {
    if (!files.audio?.[0]) {
      throw new BadRequestException('Audio file is required');
    }

    const serviceResponse = await this.musicLibraryAdminService.createTrack(
      createTrackDto,
      files.audio[0],
      files.image?.[0],
    );

    return this.response.sendResponse(res, serviceResponse);
  }

  @Put('tracks/:trackId')
  @ApiOperation({ summary: 'Update a track' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ]),
  )
  @ApiOkResponse({
    description: 'Track created successfully',
    type: AdminTrackResponseDto,
  })
  async updateTrack(
    @Param('trackId') trackId: string,
    @Body() updateTrackDto: AdminUpdateTrackDto,
    @UploadedFiles()
    files: {
      audio?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Res() res: Response,
  ) {
    const serviceResponse = await this.musicLibraryAdminService.updateTrack(
      trackId,
      updateTrackDto,
      files.audio?.[0],
      files.image?.[0],
    );

    return this.response.sendResponse(res, serviceResponse);
  }
}
