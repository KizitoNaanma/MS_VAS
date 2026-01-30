import { ApiProperty } from '@nestjs/swagger';
import { ReligionEntity } from './religion.entity';
import { DailyPrayerEntity } from './dailyPrayer.entity';
import { DailyScriptureEntity } from './dailyScripture.entity';
import { DailyDevotionalEntity } from './dailyDevotional.entity';
import { QuizSetEntity } from './quizSet.entity';

export class ThemeEntity {
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
  })
  code: string;
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
    type: () => DailyPrayerEntity,
    isArray: true,
    required: false,
  })
  dailyPrayer?: DailyPrayerEntity[];
  @ApiProperty({
    type: () => DailyScriptureEntity,
    isArray: true,
    required: false,
  })
  dailyScripture?: DailyScriptureEntity[];
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
  @ApiProperty({
    type: () => DailyDevotionalEntity,
    isArray: true,
    required: false,
  })
  dailyDevotional?: DailyDevotionalEntity[];
  @ApiProperty({
    type: () => QuizSetEntity,
    isArray: true,
    required: false,
  })
  quizSets?: QuizSetEntity[];
}
