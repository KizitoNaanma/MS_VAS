import { GetChapterDto, GetVerseDto } from 'src/common/dto';

export type IGetChapter = GetChapterDto;

export type IGetVerse = GetVerseDto;

export type ChapterIdType = {
  id: number;
  name: string;
};

export type ChapterType = {
  verse: string;
  text: string;
};

export type VerseType = {
  text: string;
};
