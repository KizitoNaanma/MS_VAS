import { ApiProperty } from '@nestjs/swagger';
import { DailyPrayerEntity } from './dailyPrayer.entity';
import { ThemeEntity } from './theme.entity';
import { DailyScriptureEntity } from './dailyScripture.entity';
import { DailyDevotionalEntity } from './dailyDevotional.entity';
import { CourseEntity } from './course.entity';
import { CourseCategoryEntity } from './courseCategory.entity';
import { CourseTopicEntity } from './courseTopic.entity';
import { MindfulnessResourceCategoryEntity } from './mindfulnessResourceCategory.entity';
import { TrackEntity } from './track.entity';
import { ArtistEntity } from './artist.entity';
import { AlbumEntity } from './album.entity';
import { QuoteEntity } from './quote.entity';
import { GroupEntity } from './group.entity';
import { QuizSetEntity } from './quizSet.entity';

export class ReligionEntity {
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
    type: 'string',
  })
  noun: string;
  @ApiProperty({
    type: 'string',
  })
  adjective: string;
  @ApiProperty({
    type: () => DailyPrayerEntity,
    isArray: true,
    required: false,
  })
  dailyPrayers?: DailyPrayerEntity[];
  @ApiProperty({
    type: () => ThemeEntity,
    isArray: true,
    required: false,
  })
  themes?: ThemeEntity[];
  @ApiProperty({
    type: () => DailyScriptureEntity,
    isArray: true,
    required: false,
  })
  dailyScriptures?: DailyScriptureEntity[];
  @ApiProperty({
    description: 'The date the religion was created',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    description: 'The date the religion was last updated',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: () => DailyDevotionalEntity,
    isArray: true,
    required: false,
  })
  dailyDevotionals?: DailyDevotionalEntity[];
  @ApiProperty({
    type: () => CourseEntity,
    isArray: true,
    required: false,
  })
  courses?: CourseEntity[];
  @ApiProperty({
    type: () => CourseCategoryEntity,
    isArray: true,
    required: false,
  })
  courseCategories?: CourseCategoryEntity[];
  @ApiProperty({
    type: () => CourseTopicEntity,
    isArray: true,
    required: false,
  })
  courseTopics?: CourseTopicEntity[];
  @ApiProperty({
    type: () => MindfulnessResourceCategoryEntity,
    isArray: true,
    required: false,
  })
  mindfulnessResourceCategory?: MindfulnessResourceCategoryEntity[];
  @ApiProperty({
    type: () => TrackEntity,
    isArray: true,
    required: false,
  })
  tracks?: TrackEntity[];
  @ApiProperty({
    type: () => ArtistEntity,
    isArray: true,
    required: false,
  })
  artists?: ArtistEntity[];
  @ApiProperty({
    type: () => AlbumEntity,
    isArray: true,
    required: false,
  })
  albums?: AlbumEntity[];
  @ApiProperty({
    type: () => QuoteEntity,
    isArray: true,
    required: false,
  })
  quotes?: QuoteEntity[];
  @ApiProperty({
    type: () => GroupEntity,
    isArray: true,
    required: false,
  })
  groups?: GroupEntity[];
  @ApiProperty({
    type: () => QuizSetEntity,
    isArray: true,
    required: false,
  })
  quizSets?: QuizSetEntity[];
}
