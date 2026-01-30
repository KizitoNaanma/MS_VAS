import { ApiProperty } from '@nestjs/swagger';

export class TrackDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    description: 'The duration of the track in seconds',
    type: 'integer',
    format: 'int32',
  })
  duration: number;
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
