import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  GetCurrentUser,
  ReligionMustMatch,
  SubscriptionRequired,
} from 'src/common';
import { CurrentUserReligionInterceptor } from 'src/common/interceptors/current-user-religion.interceptor';
import { MusicLibraryService } from './music-library.service';
import { ResponseUtilsService } from '../utils';
import { CurrentUserReligion } from 'src/common/decorators/current-user-religion.decorator';
import { Religion } from '@prisma/client';
import {
  AlbumResponseDto,
  ArtistResponseDto,
  TrackResponseDto,
} from 'src/common/dto/music-library';
import { BaseResponseDto } from 'src/common/dto/common';
import { Response } from 'express';
import { SubscriptionAccessInterceptor } from 'src/common/interceptors/subscription-access.interceptor';

@ApiBearerAuth()
@ApiTags('Music-library')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@ReligionMustMatch()
@SubscriptionRequired()
@AuthorizationRequired()
@Controller('music-library')
@UseInterceptors(CurrentUserReligionInterceptor)
@UseInterceptors(SubscriptionAccessInterceptor)
export class MusicLibraryController {
  constructor(
    private readonly musicLibraryService: MusicLibraryService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('artists')
  @ApiOperation({ summary: 'Get artists' })
  @ApiOkResponse({
    description: 'Artists fetched successfully',
    type: [ArtistResponseDto],
  })
  @ApiQuery({ name: 'with_albums', type: Boolean, required: false })
  @ApiQuery({ name: 'with_albums_tracks', type: Boolean, required: false })
  async getArtists(
    @CurrentUserReligion() religion: Religion,
    @Query('with_albums') withAlbums: boolean = false,
    @Query('with_albums_tracks') withAlbumsTracks: boolean = false,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.musicLibraryService.getArtists(
      religion,
      withAlbums,
      withAlbumsTracks,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('artists/:id')
  @ApiOperation({ summary: 'Get artist by id' })
  @ApiOkResponse({
    description: 'Artist fetched successfully',
    type: ArtistResponseDto,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'with_albums', type: Boolean, required: false })
  @ApiQuery({ name: 'with_albums_tracks', type: Boolean, required: false })
  async getArtistById(
    @CurrentUserReligion() religion: Religion,
    @Param('id') artistId: string,
    @Query('with_albums') withAlbums: boolean = false,
    @Query('with_albums_tracks') withAlbumsTracks: boolean = false,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.musicLibraryService.getArtistById(
      religion,
      artistId,
      withAlbums,
      withAlbumsTracks,
    );

    return this.response.sendResponse(res, serviceResponse, {
      errorResponseFn: 'error404Response',
    });
  }

  @Get('albums')
  @ApiOperation({ summary: 'Get albums' })
  @ApiOkResponse({
    description: 'Albums fetched successfully',
    type: [AlbumResponseDto],
  })
  @ApiQuery({ name: 'with_tracks', type: Boolean, required: false })
  @ApiQuery({ name: 'with_track_artist', type: Boolean, required: false })
  async getAlbums(
    @CurrentUserReligion() religion: Religion,
    @Query('with_tracks') withTracks: boolean = false,
    @Query('with_track_artist') withTrackArtist: boolean = false,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.musicLibraryService.getAlbums(
      religion,
      withTracks,
      withTrackArtist,
    );

    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('albums/:id')
  @ApiOperation({ summary: 'Get album by id' })
  @ApiOkResponse({
    description: 'Album fetched successfully',
    type: AlbumResponseDto,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'with_tracks', type: Boolean, required: false })
  async getAlbumById(
    @CurrentUserReligion() religion: Religion,
    @Param('id') albumId: string,
    @Query('with_tracks') withTracks: boolean = false,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.musicLibraryService.getAlbumById(
      religion,
      albumId,
      withTracks,
    );

    return this.response.sendResponse(res, serviceResponse, {
      errorResponseFn: 'error404Response',
    });
  }

  @Get('tracks')
  @ApiOperation({ summary: 'Get tracks' })
  @ApiOkResponse({
    description: 'Tracks fetched successfully',
    type: [TrackResponseDto],
  })
  async getTracks(
    @CurrentUserReligion() religion: Religion,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.musicLibraryService.getTracks(religion);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('tracks/favorites')
  @ApiOperation({ summary: "Get user's favorite tracks" })
  @ApiOkResponse({
    description: 'Favorite tracks fetched successfully',
    type: [TrackResponseDto],
  })
  async getFavoriteTracks(
    @GetCurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.musicLibraryService.getFavoriteTracks(userId);

    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('tracks/search')
  @ApiOperation({ summary: 'Search tracks' })
  @ApiOkResponse({
    description: 'Tracks fetched successfully',
    type: [TrackResponseDto],
  })
  async searchTracks(
    @CurrentUserReligion() religion: Religion,
    @Query('query') query: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.musicLibraryService.searchTracks(
      religion,
      query,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('tracks/:id')
  @ApiOperation({ summary: 'Get track by id' })
  @ApiOkResponse({
    description: 'Track fetched successfully',
    type: TrackResponseDto,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'with_artist', type: Boolean, required: false })
  @ApiQuery({ name: 'with_album', type: Boolean, required: false })
  async getTrackById(
    @CurrentUserReligion() religion: Religion,
    @Param('id') trackId: string,
    @Query('with_artist') withArtist: boolean = false,
    @Query('with_album') withAlbum: boolean = false,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.musicLibraryService.getTrackById(
      religion,
      trackId,
      withArtist,
      withAlbum,
    );

    return this.response.sendResponse(res, serviceResponse, {
      errorResponseFn: 'error404Response',
    });
  }

  @Post('tracks/:id/favorite')
  @ApiOperation({ summary: 'Favorite a track' })
  @ApiOkResponse({
    description: 'Track favorited successfully',
    type: BaseResponseDto,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Track not found')
  async favoriteTrack(
    @GetCurrentUser('id') userId: string,
    @Param('id') trackId: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.musicLibraryService.favoriteTrack(
      userId,
      trackId,
    );

    return this.response.sendResponse(res, serviceResponse, {
      errorResponseFn: 'error404Response',
      successResponseFn: 'success201Response',
    });
  }

  @Delete('tracks/:id/favorite')
  @ApiOperation({ summary: 'Unfavorite a track' })
  @ApiOkResponse({
    description: 'Track unfavorited successfully',
    type: BaseResponseDto,
  })
  @ApiParam({ name: 'id', type: String })
  async unfavoriteTrack(
    @GetCurrentUser('id') userId: string,
    @Param('id') trackId: string,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.musicLibraryService.unfavoriteTrack(
      userId,
      trackId,
    );

    return this.response.sendResponse(res, serviceResponse, {
      errorResponseFn: 'error404Response',
    });
  }
}
