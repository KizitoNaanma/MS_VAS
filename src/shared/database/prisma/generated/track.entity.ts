import { ApiProperty } from '@nestjs/swagger';
import { ArtistEntity } from './artist.entity';
import { AlbumEntity } from './album.entity';
import { ReligionEntity } from './religion.entity';
import { TrackFavoriteEntity } from './trackFavorite.entity';

export class TrackEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: () => ArtistEntity,
    required: false,
  })
  artist?: ArtistEntity;
  @ApiProperty({
    type: 'string',
  })
  artistId: string;
  @ApiProperty({
    description: 'The duration of the track in seconds',
    type: 'integer',
    format: 'int32',
  })
  duration: number;
  @ApiProperty({
    type: () => AlbumEntity,
    required: false,
    nullable: true,
  })
  album?: AlbumEntity | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  albumId: string | null;
  @ApiProperty({
    type: () => ReligionEntity,
    required: false,
  })
  religion?: ReligionEntity;
  @ApiProperty({
    type: 'string',
  })
  religionId: string;
  @ApiProperty({
    type: 'string',
  })
  audioObjectKey: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageObjectKey: string | null;
  @ApiProperty({
    type: 'boolean',
  })
  isSingle: boolean;
  @ApiProperty({
    type: () => TrackFavoriteEntity,
    isArray: true,
    required: false,
  })
  favourites?: TrackFavoriteEntity[];
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
