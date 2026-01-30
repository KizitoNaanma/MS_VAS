import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database/prisma';
import { Prisma, Religion } from '@prisma/client';
import { IServiceResponse } from 'src/common';
import {
  AlbumResponseDto,
  ArtistResponseDto,
  SimpleArtistResponseDto,
  TrackResponseDto,
} from 'src/common/dto/music-library';
import { TrackEntity } from 'src/shared/database/prisma/generated/track.entity';
import { AlbumEntity } from 'src/shared/database/prisma/generated/album.entity';

export type SearchTrackResult = {
  track: TrackEntity;
};

@Injectable()
export class MusicLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getArtists(
    religion: Religion,
    withAlbums: boolean,
    withAlbumsTracks: boolean,
  ): Promise<IServiceResponse<ArtistResponseDto[]>> {
    const artists = await this.prisma.artist.findMany({
      where: { religion },
      select: {
        id: true,
        name: true,
        imageObjectKey: true,
        albums: withAlbums
          ? {
              where: { religion },
              select: {
                id: true,
                name: true,
                imageObjectKey: true,
                tracks: withAlbumsTracks
                  ? {
                      where: { religion },
                      select: {
                        id: true,
                        name: true,
                        imageObjectKey: true,
                        audioObjectKey: true,
                        duration: true,
                      },
                    }
                  : false,
              },
            }
          : false,
      },
    });

    const artistsResponseDtos = artists.map((artist) => {
      const artistResponseDto = new ArtistResponseDto(artist);
      if (withAlbums) {
        const albums = artist.albums;
        const albumsResponseDtos = albums.map((album: Partial<AlbumEntity>) => {
          const albumResponseDto = new AlbumResponseDto(album);
          if (withAlbumsTracks) {
            const tracks = album.tracks;
            const tracksResponseDtos = tracks.map(
              (track: Partial<TrackEntity>) => {
                return new TrackResponseDto(track);
              },
            );
            albumResponseDto.tracks = tracksResponseDtos;
          }
          return albumResponseDto;
        });
        artistResponseDto.albums = albumsResponseDtos;
      }
      return artistResponseDto;
    });

    return {
      data: artistsResponseDtos,
      message: 'Artists fetched successfully',
      success: true,
    };
  }

  async getArtistById(
    religion: Religion,
    artistId: string,
    withAlbums: boolean,
    withAlbumsTracks: boolean,
  ): Promise<IServiceResponse<ArtistResponseDto>> {
    const artist = await this.prisma.artist.findUnique({
      where: { id: artistId, religion },
      select: {
        id: true,
        name: true,
        imageObjectKey: true,
        albums: withAlbums
          ? {
              select: {
                id: true,
                name: true,
                imageObjectKey: true,
                tracks: withAlbumsTracks
                  ? {
                      select: {
                        id: true,
                        name: true,
                        imageObjectKey: true,
                        audioObjectKey: true,
                        duration: true,
                      },
                    }
                  : false,
              },
            }
          : false,
      },
    });

    if (!artist) {
      return {
        data: null,
        message: 'Artist not found',
        success: false,
      };
    }

    return {
      data: new ArtistResponseDto(artist),
      message: 'Artist fetched successfully',
      success: true,
    };
  }

  async getAlbums(
    religion: Religion,
    withTracks: boolean,
    withTrackArtist: boolean,
  ): Promise<IServiceResponse<AlbumResponseDto[]>> {
    const albums = await this.prisma.album.findMany({
      where: { religion },
      select: {
        id: true,
        name: true,
        imageObjectKey: true,
        tracks: withTracks
          ? {
              where: { religion },
              select: {
                id: true,
                name: true,
                imageObjectKey: true,
                audioObjectKey: true,
                duration: true,
                artist: withTrackArtist
                  ? {
                      select: {
                        id: true,
                        name: true,
                        imageObjectKey: true,
                      },
                    }
                  : false,
              },
            }
          : false,
      },
    });

    const albumsResponseDtos = albums.map((album) => {
      const albumResponseDto = new AlbumResponseDto(album);
      if (withTracks) {
        const tracks = album.tracks;
        const tracksResponseDtos = tracks.map((track: Partial<TrackEntity>) => {
          const trackResponseDto = new TrackResponseDto(track);
          if (withTrackArtist) {
            trackResponseDto.artist = new SimpleArtistResponseDto(track.artist);
          }
          return trackResponseDto;
        });
        albumResponseDto.tracks = tracksResponseDtos;
      }
      return albumResponseDto;
    });

    return {
      data: albumsResponseDtos,
      message: 'Albums fetched successfully',
      success: true,
    };
  }

  async getAlbumById(
    religion: Religion,
    albumId: string,
    withTracks: boolean,
  ): Promise<IServiceResponse<AlbumResponseDto>> {
    const album = await this.prisma.album.findUnique({
      where: { id: albumId, religion },
      select: {
        id: true,
        name: true,
        imageObjectKey: true,
        tracks: withTracks
          ? {
              where: { religion },
              select: {
                id: true,
                name: true,
                imageObjectKey: true,
                audioObjectKey: true,
                duration: true,
                artist: {
                  select: {
                    id: true,
                    name: true,
                    imageObjectKey: true,
                  },
                },
              },
            }
          : false,
      },
    });

    if (!album) {
      return {
        data: null,
        message: 'Album not found',
        success: false,
      };
    }

    const albumResponseDto = new AlbumResponseDto(album);

    if (withTracks) {
      const tracks = album.tracks;
      const tracksResponseDtos = tracks.map((track: Partial<TrackEntity>) => {
        return new TrackResponseDto({
          ...track,
          artist: new ArtistResponseDto(track.artist),
        });
      });
      albumResponseDto.tracks = tracksResponseDtos;
    }

    return {
      data: albumResponseDto,
      message: 'Album fetched successfully',
      success: true,
    };
  }

  async getTracks(
    religion: Religion,
  ): Promise<IServiceResponse<TrackResponseDto[]>> {
    const tracks = await this.prisma.track.findMany({
      where: { religion },
      select: {
        id: true,
        name: true,
        imageObjectKey: true,
        audioObjectKey: true,
        duration: true,
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

    const tracksResponseDtos = tracks.map((track) => {
      const trackArtist = new ArtistResponseDto(track.artist);
      const trackAlbum = new AlbumResponseDto(track.album);
      return new TrackResponseDto({
        ...track,
        artist: trackArtist,
        album: trackAlbum,
      });
    });

    return {
      data: tracksResponseDtos,
      message: 'Tracks fetched successfully',
      success: true,
    };
  }

  async searchTracks(
    religion: Religion,
    query: string,
  ): Promise<IServiceResponse<TrackResponseDto[]>> {
    const searchKeywords = query.trim().split(' ').join(' | ');

    const tracks = await this.prisma
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
    WHERE ("Track"."religionId" = ${religion.id})
    AND (
      to_tsvector('english', "Track"."name") @@ to_tsquery(${searchKeywords})
      OR to_tsvector('english', "Artist"."name") @@ to_tsquery(${searchKeywords})
      OR to_tsvector('english', "Album"."name") @@ to_tsquery(${searchKeywords})
      OR "Track"."name" ILIKE '%' || ${searchKeywords} || '%'
      OR "Artist"."name" ILIKE '%' || ${searchKeywords} || '%'
      OR "Album"."name" ILIKE '%' || ${searchKeywords} || '%')`,
      )
      .then((results) => results.map((r) => r.track));

    const tracksResponseDtos = tracks.map((track) => {
      const trackArtist = new ArtistResponseDto(track.artist);
      const trackAlbum = new AlbumResponseDto(track.album);
      return new TrackResponseDto({
        ...track,
        artist: trackArtist,
        album: trackAlbum,
      });
    });

    return {
      data: tracksResponseDtos,
      message: 'Search tracks results fetched successfully',
      success: true,
    };
  }

  async getTrackById(
    religion: Religion,
    trackId: string,
    withArtist: boolean,
    withAlbum: boolean,
  ): Promise<IServiceResponse<TrackResponseDto>> {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId, religion },
      select: {
        id: true,
        name: true,
        imageObjectKey: true,
        audioObjectKey: true,
        duration: true,
        artist: withArtist
          ? {
              select: {
                id: true,
                name: true,
                imageObjectKey: true,
              },
            }
          : false,
        album: withAlbum
          ? {
              select: {
                id: true,
                name: true,
                imageObjectKey: true,
              },
            }
          : false,
      },
    });

    if (!track) {
      return {
        data: null,
        message: 'Track not found',
        success: false,
      };
    }

    const trackArtist = new ArtistResponseDto(track.artist);
    const trackAlbum = new AlbumResponseDto(track.album);
    const trackResponseDto = new TrackResponseDto({
      ...track,
      ...(withArtist && { artist: trackArtist }),
      ...(withAlbum && { album: trackAlbum }),
    });

    return {
      data: trackResponseDto,
      message: 'Track fetched successfully',
      success: true,
    };
  }

  async favoriteTrack(
    userId: string,
    trackId: string,
  ): Promise<IServiceResponse> {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return {
        data: null,
        message: 'Track not found',
        success: false,
      };
    }

    const favorite = await this.prisma.trackFavorite.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });

    if (favorite) {
      return {
        message: 'Track already favorited',
        success: false,
      };
    }

    await this.prisma.trackFavorite.create({
      data: { userId, trackId },
    });

    return {
      message: 'Track favorited successfully',
      success: true,
    };
  }

  async unfavoriteTrack(
    userId: string,
    trackId: string,
  ): Promise<IServiceResponse> {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return {
        message: 'Track not found',
        success: false,
      };
    }

    await this.prisma.trackFavorite.delete({
      where: { userId_trackId: { userId, trackId } },
    });

    return {
      message: 'Track unfavorited successfully',
      success: true,
    };
  }

  async getFavoriteTracks(
    userId: string,
  ): Promise<IServiceResponse<TrackResponseDto[]>> {
    const favoriteTracks = await this.prisma.trackFavorite.findMany({
      where: { userId },
      select: {
        track: {
          select: {
            id: true,
          },
        },
      },
    });

    const tracks = await this.prisma.track.findMany({
      where: {
        id: { in: favoriteTracks.map((favorite) => favorite.track.id) },
      },
      select: {
        id: true,
        name: true,
        imageObjectKey: true,
        audioObjectKey: true,
        duration: true,
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

    const tracksResponseDtos = tracks.map((track) => {
      const trackArtist = new ArtistResponseDto(track.artist);
      const trackAlbum = new AlbumResponseDto(track.album);
      return new TrackResponseDto({
        ...track,
        artist: trackArtist,
        album: trackAlbum,
      });
    });

    return {
      data: tracksResponseDtos,
      message: 'Favorite tracks fetched successfully',
      success: true,
    };
  }
}
