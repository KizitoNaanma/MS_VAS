import { ApiProperty } from '@nestjs/swagger';
import { ReligionEntity } from './religion.entity';
import { ArtistEntity } from './artist.entity';
import { TrackEntity } from './track.entity';

export class AlbumEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageObjectKey: string | null;
  @ApiProperty({
    type: 'string',
  })
  slug: string;
  @ApiProperty({
    type: () => ReligionEntity,
    required: false,
    nullable: true,
  })
  religion?: ReligionEntity | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  religionId: string | null;
  @ApiProperty({
    type: () => ArtistEntity,
    isArray: true,
    required: false,
  })
  artists?: ArtistEntity[];
  @ApiProperty({
    type: () => TrackEntity,
    isArray: true,
    required: false,
  })
  tracks?: TrackEntity[];
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
