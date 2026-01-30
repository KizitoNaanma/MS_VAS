import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ICacheService,
  IHttpService,
  ONLINE_QURAN_API_BASE_URL,
  ONLINE_QURAN_API_RAPID_API_KEY,
} from 'src/common';
import { TimeUtilsService } from 'src/modules/utils';

@Injectable()
export class OnlineQuranApiServices implements OnModuleInit {
  private readonly logger = new Logger(OnlineQuranApiServices.name);
  private readonly SURAHS_CACHE_KEY = 'online-quran-api-raw-surahs';

  constructor(
    private readonly http: IHttpService,
    private readonly time: TimeUtilsService,
    @Inject('Redis') private readonly cache: ICacheService,
  ) {}

  private config() {
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': ONLINE_QURAN_API_RAPID_API_KEY,
      },
      timeout: this.time.convertToMilliseconds('minutes', 2),
    };
  }

  private readonly CACHE_TTL = this.time.convertToMilliseconds('days', 120); // 120 days

  private readonly REFRESH_THRESHOLD = this.time.convertToMilliseconds(
    'days',
    30,
  ); // 30 days

  async getSurahsFromAPI(): Promise<Record<string, any>> {
    const config = this.config();
    const response = await this.http.get(
      `${ONLINE_QURAN_API_BASE_URL}/surahs`,
      config,
    );

    return response;
  }
  async getSurah(surahName: string) {
    const config = this.config();
    const response = await this.http.get(
      `${ONLINE_QURAN_API_BASE_URL}/surahs/${surahName}`,
      config,
    );

    return response;
  }

  private async storeSurahs() {
    const metadata = await this.cache.get(`${this.SURAHS_CACHE_KEY}:meta`);
    const isStale =
      !metadata || Date.now() - metadata.timestamp > this.REFRESH_THRESHOLD;

    if (!isStale) {
      return;
    }

    const surahs = await this.getSurahsFromAPI();

    await Promise.all([
      this.cache.set(this.SURAHS_CACHE_KEY, surahs, this.CACHE_TTL),
      this.cache.set(
        `${this.SURAHS_CACHE_KEY}:meta`,
        { timestamp: Date.now() },
        this.CACHE_TTL,
      ),
    ]);

    return surahs;
  }

  private async refreshSurahsCacheIfNeeded() {
    const metadata = await this.cache.get(`${this.SURAHS_CACHE_KEY}:meta`);
    const isStale =
      !metadata || Date.now() - metadata.timestamp > this.REFRESH_THRESHOLD;

    if (isStale) {
      await this.storeSurahs();
    }
  }

  async onModuleInit() {
    try {
      await this.storeSurahs();
      this.logger.log('Online Quran API cache initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Online Quran API cache:', error);
    }
  }

  async getSurahs(): Promise<Record<string, any>> {
    const cachedValue = await this.cache.get(this.SURAHS_CACHE_KEY);

    if (cachedValue) {
      this.refreshSurahsCacheIfNeeded().catch((error) =>
        this.logger.error('Background cache refresh failed for surahs:', error),
      );
      return cachedValue;
    }

    return await this.storeSurahs();
  }
}
