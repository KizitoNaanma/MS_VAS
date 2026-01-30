import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  copyNonNullFields,
  getS3FileUrl,
  NestedPartial,
} from 'src/modules/utils';
import { AlbumEntity } from 'src/shared/database/prisma/generated/album.entity';
import { ArtistEntity } from 'src/shared/database/prisma/generated/artist.entity';
import { TrackEntity } from 'src/shared/database/prisma/generated/track.entity';
import { PageDto } from '../pagination';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ReligionEnum } from 'src/common/enum';

export class SimpleArtistResponseDto extends PickType(ArtistEntity, [
  'id',
  'name',
]) {
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageUrl: string | null;

  constructor(artist: Partial<ArtistEntity>) {
    super();
    copyNonNullFields(artist, this, ['imageObjectKey']);
    this.imageUrl = getS3FileUrl(artist.imageObjectKey);
  }
}

export class SimpleAlbumResponseDto extends PickType(AlbumEntity, [
  'id',
  'name',
]) {
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageUrl: string | null;

  constructor(album: Partial<AlbumEntity>) {
    super();
    copyNonNullFields(album, this, ['imageObjectKey']);
    this.imageUrl = getS3FileUrl(album.imageObjectKey);
  }
}

export class SimpleTrackResponseDto extends PickType(TrackEntity, [
  'id',
  'name',
  'duration',
]) {
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  audioUrl: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageUrl: string | null;

  constructor(track: Partial<TrackEntity>) {
    super();
    copyNonNullFields(track, this, ['audioObjectKey', 'imageObjectKey']);
    this.audioUrl = getS3FileUrl(track.audioObjectKey);
    this.imageUrl = getS3FileUrl(track.imageObjectKey);
  }
}

export class TrackResponseDto extends PickType(TrackEntity, [
  'id',
  'name',
  'duration',
]) {
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  audioUrl: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageUrl: string | null;
  @ApiProperty({
    type: SimpleArtistResponseDto,
    nullable: true,
    required: false,
  })
  artist?: SimpleArtistResponseDto;

  @ApiProperty({
    type: SimpleAlbumResponseDto,
    nullable: true,
    required: false,
  })
  album?: SimpleAlbumResponseDto;

  constructor(track: NestedPartial<TrackEntity>) {
    super();
    copyNonNullFields(track, this, ['audioObjectKey', 'imageObjectKey']);
    this.audioUrl = getS3FileUrl(track.audioObjectKey);
    this.imageUrl = getS3FileUrl(track.imageObjectKey);
  }
}

export class AdminTrackResponseDto extends TrackResponseDto {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}

export class AdminTrackPaginatedResponseDto extends PageDto<AdminTrackResponseDto> {
  @ApiProperty({
    type: () => [AdminTrackResponseDto],
  })
  data: AdminTrackResponseDto[];
}

export class AlbumResponseDto extends SimpleAlbumResponseDto {
  @ApiProperty({
    type: TrackResponseDto,
    isArray: true,
    nullable: true,
    required: false,
  })
  tracks?: TrackResponseDto[];

  @ApiProperty({
    type: SimpleArtistResponseDto,
    isArray: true,
    nullable: true,
    required: false,
  })
  artists?: SimpleArtistResponseDto[];
}

export class ArtistResponseDto extends SimpleArtistResponseDto {
  @ApiProperty({
    type: AlbumResponseDto,
    isArray: true,
    nullable: true,
    required: false,
  })
  albums?: AlbumResponseDto[];
}

export class FavoriteTrackResponseDto extends SimpleTrackResponseDto {
  isFavorite: boolean;
}

export class AdminCreateTrackDto {
  @ApiProperty({
    type: 'string',
  })
  @IsUUID()
  @IsNotEmpty()
  artistId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({
    description: 'The duration of the track in seconds',
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsString()
  duration: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  albumId: string;

  @ApiProperty({
    enum: ReligionEnum,
  })
  @IsNotEmpty()
  @IsEnum(ReligionEnum, {
    message: `Valid options for religion are ${Object.values(ReligionEnum)}`,
  })
  religion: ReligionEnum;

  @ApiProperty({ type: 'boolean', required: false, default: false })
  @IsOptional()
  isSingle?: boolean = false;

  @ApiProperty({
    description: 'The audio file for the track',
    type: 'file',
    format: 'binary',
  })
  audio?: Express.Multer.File;

  @ApiProperty({
    description: 'The image file for the track',
    type: 'file',
    format: 'binary',
    required: false,
  })
  image?: Express.Multer.File;
}

export class AdminUpdateTrackDto extends PartialType(AdminCreateTrackDto) {}
