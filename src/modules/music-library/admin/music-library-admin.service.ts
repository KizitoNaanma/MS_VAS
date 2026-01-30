import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AdminCreateTrackDto,
  AdminTrackPaginatedResponseDto,
  AdminUpdateTrackDto,
  AlbumResponseDto,
  TrackResponseDto,
} from 'src/common/dto/music-library';
import {
  IServiceResponse,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
  ReligionEnum,
} from 'src/common';
import {
  AdminTrackResponseDto,
  ArtistResponseDto,
} from 'src/common/dto/music-library';
import { PrismaService } from 'src/common/services/database/prisma';
import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';
import slugify from 'slugify';
import { SearchTrackResult } from '../music-library.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MusicLibraryAdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  private generateTrackMediaS3Key(
    filename: string,
    trackName: string,
    religionCode: string,
    mediaType: 'audio' | 'image' = 'audio',
  ): string {
    const file_ext = filename.split('.').pop();
    const _filename = `${mediaType === 'image' ? 'IMG-' : ''}${Date.now()}.${file_ext}`;
    return `music-lib/${religionCode}/tracks/${slugify(trackName.toLowerCase())}/${_filename}`;
  }

  async getTracks(
    pageOptionsDto: PageOptionsDto,
  ): Promise<IServiceResponse<AdminTrackPaginatedResponseDto>> {
    const tracks = await this.prismaService.track.findMany({
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.pageSize,
      orderBy: {
        createdAt: pageOptionsDto.order,
      },
      select: {
        id: true,
        name: true,
        imageObjectKey: true,
        audioObjectKey: true,
        duration: true,
        createdAt: true,
        artist: {
          select: {
            id: true,
            name: true,
            imageObjectKey: true,
          },
        },
        album: {
          select: {
            id: true,
            name: true,
            imageObjectKey: true,
          },
        },
      },
    });

    const adminTracksResponseDtos = tracks.map((track) => {
      const trackArtist = new ArtistResponseDto(track.artist);
      const trackAlbum = new AlbumResponseDto(track.album);
      return new AdminTrackResponseDto({
        ...track,
        artist: trackArtist,
        album: trackAlbum,
      });
    });

    const itemCount = await this.prismaService.track.count();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return {
      data: new PageDto(adminTracksResponseDtos, pageMetaDto),
      message: 'Tracks fetched successfully',
      success: true,
    };
  }

  async getArtists(): Promise<IServiceResponse<ArtistResponseDto[]>> {
    const artists = await this.prismaService.artist.findMany({
      select: {
        id: true,
        name: true,
        imageObjectKey: true,
      },
    });

    const artistsResponseDtos = artists.map((artist) => {
      const artistResponseDto = new ArtistResponseDto(artist);

      return artistResponseDto;
    });

    return {
      data: artistsResponseDtos,
      message: 'Artists fetched successfully',
      success: true,
    };
  }

  async getAlbums(): Promise<IServiceResponse<AlbumResponseDto[]>> {
    const albums = await this.prismaService.album.findMany({
      select: {
        id: true,
        name: true,
        imageObjectKey: true,
      },
    });

    const albumsResponseDtos = albums.map((album) => {
      const albumResponseDto = new AlbumResponseDto(album);
      return albumResponseDto;
    });

    return {
      data: albumsResponseDtos,
      message: 'Albums fetched successfully',
      success: true,
    };
  }

  async createTrack(
    createTrackDto: AdminCreateTrackDto,
    audioFile: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<IServiceResponse<AdminTrackResponseDto>> {
    const religion = await this.prismaService.religion.findFirst({
      where: {
        code: createTrackDto.religion,
      },
    });

    if (!religion) {
      throw new BadRequestException('Religion not found');
    }

    // Validate artist exists
    const artist = await this.prismaService.artist.findUnique({
      where: { id: createTrackDto.artistId },
    });
    if (!artist) {
      throw new BadRequestException('Artist not found');
    }

    // Validate album exists if provided
    if (createTrackDto.albumId) {
      const album = await this.prismaService.album.findUnique({
        where: { id: createTrackDto.albumId },
      });
      if (!album) {
        throw new BadRequestException('Album not found');
      }
    }

    // Upload audio file to S3
    const audioS3Key = this.generateTrackMediaS3Key(
      audioFile.originalname,
      createTrackDto.name,
      religion.code === ReligionEnum.CHRISTIANITY ? 'christian' : 'islam',
    );
    const audioUpload = await this.s3StorageService.uploadFile(
      audioFile,
      audioS3Key,
    );

    // Upload image file to S3 if provided
    let imageUpload;
    if (imageFile) {
      const imageS3Key = this.generateTrackMediaS3Key(
        imageFile.originalname,
        createTrackDto.name,
        religion.code === ReligionEnum.CHRISTIANITY ? 'christian' : 'islam',
        'image',
      );
      imageUpload = await this.s3StorageService.uploadFile(
        imageFile,
        imageS3Key,
      );
    }

    // Create track in database
    const track = await this.prismaService.track.create({
      data: {
        name: createTrackDto.name,
        artistId: createTrackDto.artistId,
        ...(createTrackDto.albumId && {
          albumId: createTrackDto.albumId,
        }),
        religionId: religion.id,
        duration: parseInt(createTrackDto.duration),
        isSingle: (createTrackDto.isSingle as unknown as string) === 'true',
        audioObjectKey: audioUpload.Key,
        imageObjectKey: imageUpload?.Key,
      },
      include: {
        artist: true,
        album: true,
      },
    });

    const trackResponseDto = new AdminTrackResponseDto({
      ...track,
      artist: new ArtistResponseDto(track.artist),
      album: new AlbumResponseDto(track.album),
    });

    return {
      data: trackResponseDto,
      message: 'Track created successfully',
      success: true,
    };
  }

  async updateTrack(
    trackId: string,
    updateTrackDto: AdminUpdateTrackDto,
    audioFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<IServiceResponse<AdminTrackResponseDto>> {
    // Verify track exists
    const existingTrack = await this.prismaService.track.findUnique({
      where: { id: trackId },
    });

    if (!existingTrack) {
      throw new BadRequestException('Track not found');
    }

    let religion;
    if (updateTrackDto.religion) {
      religion = await this.prismaService.religion.findFirst({
        where: {
          code: updateTrackDto.religion,
        },
      });

      if (!religion) {
        throw new BadRequestException('Religion not found');
      }
    }

    // Validate artist exists if provided
    if (updateTrackDto.artistId) {
      const artist = await this.prismaService.artist.findUnique({
        where: { id: updateTrackDto.artistId },
      });
      if (!artist) {
        throw new BadRequestException('Artist not found');
      }
    }

    // Validate album exists if provided
    if (updateTrackDto.albumId) {
      const album = await this.prismaService.album.findUnique({
        where: { id: updateTrackDto.albumId },
      });
      if (!album) {
        throw new BadRequestException('Album not found');
      }
    }

    // Handle audio file update if provided
    let audioObjectKey = existingTrack.audioObjectKey;
    if (audioFile) {
      const audioS3Key = this.generateTrackMediaS3Key(
        audioFile.originalname,
        updateTrackDto.name || existingTrack.name,
        religion?.code === ReligionEnum.CHRISTIANITY ? 'christian' : 'islam',
      );
      const audioUpload = await this.s3StorageService.uploadFile(
        audioFile,
        audioS3Key,
      );
      audioObjectKey = audioUpload.Key;
    }

    // Handle image file update if provided
    let imageObjectKey = existingTrack.imageObjectKey;
    if (imageFile) {
      const imageS3Key = this.generateTrackMediaS3Key(
        imageFile.originalname,
        updateTrackDto.name || existingTrack.name,
        religion?.code === ReligionEnum.CHRISTIANITY ? 'christian' : 'islam',
        'image',
      );
      const imageUpload = await this.s3StorageService.uploadFile(
        imageFile,
        imageS3Key,
      );
      imageObjectKey = imageUpload.Key;
    }

    // Update track in database
    const track = await this.prismaService.track.update({
      where: { id: trackId },
      data: {
        ...(updateTrackDto.name && { name: updateTrackDto.name }),
        ...(updateTrackDto.artistId && { artistId: updateTrackDto.artistId }),
        ...(updateTrackDto.albumId && { albumId: updateTrackDto.albumId }),
        ...(religion && { religionId: religion.id }),
        ...(updateTrackDto.duration && {
          duration: parseInt(updateTrackDto.duration),
        }),
        ...(updateTrackDto.isSingle && {
          isSingle: (updateTrackDto.isSingle as unknown as string) === 'true',
        }),
        audioObjectKey,
        imageObjectKey,
      },
      include: {
        artist: true,
        album: true,
      },
    });

    const trackResponseDto = new AdminTrackResponseDto({
      ...track,
      artist: new ArtistResponseDto(track.artist),
      album: new AlbumResponseDto(track.album),
    });

    return {
      data: trackResponseDto,
      message: 'Track updated successfully',
      success: true,
    };
  }

  async searchAllTracks(
    query: string,
  ): Promise<IServiceResponse<TrackResponseDto[]>> {
    const searchKeywords = query.trim().split(' ').join(' | ');

    const tracks = await this.prismaService
      .$queryRaw<SearchTrackResult[]>(
        Prisma.sql`SELECT
        json_build_object(
          'id', "Track"."id",
          'name', "Track"."name",
          'imageObjectKey', "Track"."imageObjectKey",
          'audioObjectKey', "Track"."audioObjectKey",
          'duration', "Track"."duration",
          'artist', json_build_object(
            'id', "Artist"."id",
            'name', "Artist"."name",
            'imageObjectKey', "Artist"."imageObjectKey"
          ),
          'album', json_build_object(
            'id', "Album"."id",
            'name', "Album"."name",
            'imageObjectKey', "Album"."imageObjectKey"
          )
        ) as track
      FROM "Track"
      LEFT JOIN "Artist" ON "Track"."artistId" = "Artist"."id"
      LEFT JOIN "Album" ON "Track"."albumId" = "Album"."id"
      WHERE (
        to_tsvector('english', "Track"."name") @@ to_tsquery(${searchKeywords})
        OR to_tsvector('english', "Artist"."name") @@ to_tsquery(${searchKeywords})
        OR to_tsvector('english', "Album"."name") @@ to_tsquery(${searchKeywords})
        OR "Track"."name" ILIKE '%' || ${searchKeywords} || '%'
        OR "Artist"."name" ILIKE '%' || ${searchKeywords} || '%'
        OR "Album"."name" ILIKE '%' || ${searchKeywords} || '%')`,
      )
      .then((results) => results.map((r) => r.track));

    const allTracksResponseDtos = tracks.map((track) => {
      const trackArtist = new ArtistResponseDto(track.artist);
      const trackAlbum = new AlbumResponseDto(track.album);
      return new TrackResponseDto({
        ...track,
        artist: trackArtist,
        album: trackAlbum,
      });
    });

    return {
      data: allTracksResponseDtos,
      message: 'Search tracks results fetched successfully',
      success: true,
    };
  }
}
