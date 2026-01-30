import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ChapterIdType,
  ChapterType,
  ICacheService,
  IGetChapter,
  IGetVerse,
  ProvidersEnum,
  VerseType,
} from 'src/common';
import { IqBibleServices } from 'src/common/services/provider-services/iq-bible';
import { ResponseUtilsService, TimeUtilsService } from 'src/modules/utils';
import bibleInfo from './bible.json';

@Injectable()
export class BibleService {
  private readonly bibleInfo = bibleInfo;
  constructor(
    private readonly iqBibleServices: IqBibleServices,
    private readonly response: ResponseUtilsService,
    private readonly time: TimeUtilsService,
    @Inject('Redis') private readonly cache: ICacheService,
  ) {}

  private readonly CACHE_TTL = {
    VERSIONS: this.time.convertToMilliseconds('days', 120), // 120 days
    BOOKS: this.time.convertToMilliseconds('days', 120), // 120 days
    CHAPTERS: this.time.convertToMilliseconds('days', 30), // 30 days (in case of API changes)
    VERSES: this.time.convertToMilliseconds('days', 30), // 30 days
  };

  private generateChapters(chapterCount: number): ChapterIdType[] {
    return Array.from({ length: chapterCount }, (_, index) => ({
      id: index + 1,
      name: `Chapter ${index + 1}`,
    }));
  }

  private generateIQBibleVerseId(
    bookId: number,
    chapterId: number,
    verseId: number,
    padLength = 3,
  ): string {
    const paddedChapter = chapterId.toString().padStart(padLength, '0');
    const paddedVerse = verseId.toString().padStart(padLength, '0');
    return `${bookId}${paddedChapter}${paddedVerse}`;
  }

  async getVersions() {
    const bibleVersions = await this.iqBibleServices.getVersions();
    const data = bibleVersions.map((versionObj: Record<string, string>) => {
      const { version, abbreviation } = versionObj;
      return { version: version.toLowerCase(), abbreviation };
    });

    return this.response.success200Response({
      message: 'Successfully retrieved versions',
      data,
    });
  }

  async getBooks() {
    const cacheKey = `${ProvidersEnum.IQ_BIBLE}-processed-books`;
    const cachedValue = await this.cache.get(cacheKey);

    if (cachedValue) {
      return this.response.success200Response({
        message: 'Successfully retrieved books',
        data: cachedValue,
      });
    } else {
      const bibleBooks = await this.iqBibleServices.getBooks();
      const data = bibleBooks.map((book: Record<string, string>) => {
        const bookObj = this.bibleInfo.find((b) => b.id === Number(book.b));
        const chaptersIds = this.generateChapters(bookObj.chapters.length);
        const { b: number, n: name } = book;
        return { number, name, chaptersIds };
      });

      // cache for 120 days
      await this.cache.set(cacheKey, data, this.CACHE_TTL.BOOKS);
      return this.response.success200Response({
        message: 'Successfully retrieved books',
        data,
      });
    }
  }

  async getChapter(payload: IGetChapter) {
    const { versionId, bookId, chapterId } = payload;
    const cacheKey = `${ProvidersEnum.IQ_BIBLE}-processed-chapter-${versionId}-${bookId}-${chapterId}`;
    const cachedValue = await this.cache.get(cacheKey);

    let data: ChapterType[] = [];

    if (cachedValue) {
      return this.response.success200Response({
        message: 'Successfully retrieved chapter',
        data: cachedValue,
      });
    } else {
      const chapter = await this.iqBibleServices.getChapter({
        bookId,
        versionId,
        chapterId,
      });

      data = chapter.map((book: Record<string, string>) => {
        const { v: verse, t: text } = book;
        return { verse, text };
      });

      // cache for 30 days
      await this.cache.set(cacheKey, data, this.CACHE_TTL.CHAPTERS);
      return this.response.success200Response({
        message: 'Successfully retrieved chapter',
        data,
      });
    }
  }

  async getChapterVerseCount(bookId: number, chapterId: number) {
    const book = this.bibleInfo.find((b) => b.id === bookId);
    const chapterInfo = book.chapters.find(
      (c) => Number(c.chapter) === chapterId,
    );
    return this.response.success200Response({
      message: 'Successfully retrieved chapter verse count',
      data: chapterInfo.verses,
    });
  }

  async getVerse(payload: IGetVerse) {
    const { versionId, bookId, chapterId, verseId } = payload;
    const cacheKey = `${ProvidersEnum.IQ_BIBLE}-processed-verse-${versionId}-${bookId}-${chapterId}-${verseId}`;
    const cachedValue = await this.cache.get(cacheKey);

    let data: VerseType = { text: '' };

    if (cachedValue) {
      return this.response.success200Response({
        message: 'Successfully retrieved verse',
        data: cachedValue,
      });
    } else {
      // validate chapterId and verseId
      const book = this.bibleInfo.find((b) => b.id === parseInt(bookId));
      const chapter = book.chapters.find((c) => c.chapter === chapterId);
      const isValidChapterId = chapter !== undefined;

      if (!isValidChapterId) {
        throw new BadRequestException('Invalid chapter');
      }

      const isValidVerseId =
        parseInt(verseId) > 0 && parseInt(verseId) <= parseInt(chapter.verses);

      if (!isValidVerseId) {
        throw new BadRequestException('Invalid verse');
      }

      const iqBibleVerseId = this.generateIQBibleVerseId(
        parseInt(bookId),
        parseInt(chapterId),
        parseInt(verseId),
      );
      const verse = await this.iqBibleServices.getVerse({
        verseId: iqBibleVerseId,
        versionId,
      });

      const verseText = verse?.[0]?.t;

      data = { text: verseText };

      // cache for 30 days
      await this.cache.set(cacheKey, data, this.CACHE_TTL.VERSES);

      return this.response.success200Response({
        message: 'Successfully retrieved verse',
        data,
      });
    }
  }
}
