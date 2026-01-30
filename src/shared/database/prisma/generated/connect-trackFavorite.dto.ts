import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TrackFavoriteUserIdTrackIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  trackId: string;
}

@ApiExtraModels(TrackFavoriteUserIdTrackIdUniqueInputDto)
export class ConnectTrackFavoriteDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: TrackFavoriteUserIdTrackIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TrackFavoriteUserIdTrackIdUniqueInputDto)
  userId_trackId?: TrackFavoriteUserIdTrackIdUniqueInputDto;
}
