import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ICacheService,
  IHttpService,
  IQ_BIBLE_BASE_URL,
  IQ_BIBLE_RAPID_API_KEY,
} from 'src/common';
import { TimeUtilsService } from 'src/modules/utils';

@Injectable()
export class IqBibleServices implements OnModuleInit {
  private readonly logger = new Logger(IqBibleServices.name);
  private readonly BOOKS_CACHE_KEY = 'iq-bible-raw-books';
  private readonly VERSIONS_CACHE_KEY = 'iq-bible-raw-versions';
  constructor(
    private readonly http: IHttpService,
    private readonly time: TimeUtilsService,
    @Inject('Redis') private readonly cache: ICacheService,
  ) {}

  private config() {
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': IQ_BIBLE_RAPID_API_KEY,
      },
      timeout: this.time.convertToMilliseconds('minutes', 2),
    };
  }

  private readonly CACHE_TTL = {
    VERSIONS: this.time.convertToMilliseconds('days', 120), // 120 days
    BOOKS: this.time.convertToMilliseconds('days', 120), // 120 days
    CHAPTERS: this.time.convertToMilliseconds('days', 30), // 30 days (in case of API changes)
    VERSES: this.time.convertToMilliseconds('days', 30), // 30 days
  };

  private readonly REFRESH_THRESHOLD = {
    VERSIONS: this.time.convertToMilliseconds('days', 30), // 30 days
    BOOKS: this.time.convertToMilliseconds('days', 30), // 30 days
    CHAPTERS: this.time.convertToMilliseconds('days', 7), // 7 days
    VERSES: this.time.convertToMilliseconds('days', 7), // 7 days
  };

  async getVersionsFromAPI(): Promise<Record<string, string>[]> {
    const config = this.config();
    const response = await this.http.get(
      `${IQ_BIBLE_BASE_URL}/GetVersions`,
      config,
    );

    return response;
  }

  async getBooksFromAPI() {
    const config = this.config();
    const response = await this.http.get(
      `${IQ_BIBLE_BASE_URL}/GetBooks?language=english`,
      config,
    );

    return response;
  }

  async getChapter(payload: {
    bookId: string;
    chapterId: string;
    versionId: string;
  }) {
    const { bookId, chapterId, versionId } = payload;

    const config = this.config();
    const response = await this.http.get(
      `${IQ_BIBLE_BASE_URL}/GetChapter?bookId=${bookId}&chapterId=${chapterId}&versionId=${versionId}`,
      config,
    );

    return response;
  }

  async getVerse(payload: { verseId: string; versionId: string }) {
    const { verseId, versionId } = payload;

    const config = this.config();
    const response = await this.http.get(
      `${IQ_BIBLE_BASE_URL}/GetVerse?verseId=${verseId}&versionId=${versionId}`,
      config,
    );

    return response;
  }

  private async storeIQBibleVersions() {
    const versionsMetadata = await this.cache.get(
      `${this.VERSIONS_CACHE_KEY}:meta`,
    );
    const isVersionsStale =
      !versionsMetadata ||
      Date.now() - versionsMetadata.timestamp > this.REFRESH_THRESHOLD.VERSIONS;

    if (!isVersionsStale) {
      return;
    }

    const versions = await this.getVersionsFromAPI();

    await Promise.all([
      this.cache.set(
        this.VERSIONS_CACHE_KEY,
        versions,
        this.CACHE_TTL.VERSIONS,
      ),
      this.cache.set(
        `${this.VERSIONS_CACHE_KEY}:meta`,
        { timestamp: Date.now() },
        this.CACHE_TTL.VERSIONS,
      ),
    ]);

    return versions;
  }

  private async storeIQBibleBooks() {
    const booksMetadata = await this.cache.get(`${this.BOOKS_CACHE_KEY}:meta`);
    const isBooksStale =
      !booksMetadata ||
      Date.now() - booksMetadata.timestamp > this.REFRESH_THRESHOLD.BOOKS;

    if (!isBooksStale) {
      return;
    }

    const books = await this.getBooksFromAPI();

    await Promise.all([
      this.cache.set(this.BOOKS_CACHE_KEY, books, this.CACHE_TTL.BOOKS),
      this.cache.set(
        `${this.BOOKS_CACHE_KEY}:meta`,
        { timestamp: Date.now() },
        this.CACHE_TTL.BOOKS,
      ),
    ]);

    return books;
  }

  private async refreshVersionsCacheIfNeeded() {
    const metadata = await this.cache.get(`${this.VERSIONS_CACHE_KEY}:meta`);
    const isStale =
      !metadata ||
      Date.now() - metadata.timestamp > this.REFRESH_THRESHOLD.VERSIONS;

    if (isStale) {
      this.storeIQBibleVersions();
    }
  }

  private async refreshBooksCacheIfNeeded() {
    const metadata = await this.cache.get(`${this.BOOKS_CACHE_KEY}:meta`);
    const isStale =
      !metadata ||
      Date.now() - metadata.timestamp > this.REFRESH_THRESHOLD.BOOKS;

    if (isStale) {
      this.storeIQBibleBooks();
    }
  }

  async onModuleInit() {
    try {
      await Promise.all([
        this.storeIQBibleVersions(),
        this.storeIQBibleBooks(),
      ]);
      this.logger.log('IQ Bible cache initialized successfully');
    } catch (error) {
      this.logger.error(
        'Failed to initialize IQ Bible cache:',
        error?.message || error,
      );
    }
  }

  async getVersions(): Promise<Record<string, string>[]> {
    const cachedValue = await this.cache.get(this.VERSIONS_CACHE_KEY);

    if (cachedValue) {
      await this.refreshVersionsCacheIfNeeded().catch((error) =>
        this.logger.error('Background cache refresh failed:', error),
      );
      return cachedValue;
    }

    return await this.storeIQBibleVersions();
  }

  async getBooks(): Promise<Record<string, string>[]> {
    const cachedValue = await this.cache.get(this.BOOKS_CACHE_KEY);

    if (cachedValue) {
      await this.refreshBooksCacheIfNeeded().catch((error) =>
        this.logger.error('Background cache refresh failed:', error),
      );
      return cachedValue;
    }

    return await this.storeIQBibleBooks();
  }
}
