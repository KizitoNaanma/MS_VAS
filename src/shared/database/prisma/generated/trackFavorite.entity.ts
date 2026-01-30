import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { TrackEntity } from './track.entity';

export class TrackFavoriteEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => UserEntity,
    required: false,
  })
  user?: UserEntity;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    type: () => TrackEntity,
    required: false,
  })
  track?: TrackEntity;
  @ApiProperty({
    type: 'string',
  })
  trackId: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}
