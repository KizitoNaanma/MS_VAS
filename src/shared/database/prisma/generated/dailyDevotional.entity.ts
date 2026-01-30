import { ApiProperty } from '@nestjs/swagger';
import { ThemeEntity } from './theme.entity';
import { ReligionEntity } from './religion.entity';

export class DailyDevotionalEntity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  dayId: number;
  @ApiProperty({
    type: 'string',
  })
  content: string;
  @ApiProperty({
    type: () => ThemeEntity,
    required: false,
  })
  theme?: ThemeEntity;
  @ApiProperty({
    type: 'string',
  })
  themeId: string;
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
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
