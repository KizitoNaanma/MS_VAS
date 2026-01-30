import { Inject, Injectable } from '@nestjs/common';
import { ICacheService, ProvidersEnum, SurahType } from 'src/common';
import { OnlineQuranApiServices } from 'src/common/services/provider-services/online-quran-api';
import { ResponseUtilsService, TimeUtilsService } from 'src/modules/utils';

@Injectable()
export class QuranService {
  constructor(
    private readonly onlineQuranApiServices: OnlineQuranApiServices,
    private readonly response: ResponseUtilsService,
    private readonly time: TimeUtilsService,
    @Inject('Redis') private readonly cache: ICacheService,
  ) {}

  private readonly CACHE_TTL = this.time.convertToMilliseconds('days', 30); // 30 days

  async getSurahs() {
    const surahs = await this.onlineQuranApiServices.getSurahs();
    const data = surahs.surahList.map((surah: Record<string, any>) => {
      const { number, name } = surah;
      return { number, name };
    });

    return this.response.success200Response({
      message: 'Successfully retrieved surah',
      data,
    });
  }

  async getSurah(surahName: string) {
    const cacheKey = `${ProvidersEnum.ONLINE_QURAN_API}-processed-surah-${surahName}`;
    const cachedValue = await this.cache.get(cacheKey);

    let data: SurahType[] = [];

    if (cachedValue) {
      return this.response.success200Response({
        message: 'Successfully retrieved surah',
        data: cachedValue,
      });
    } else {
      const surah = await this.onlineQuranApiServices.getSurah(surahName);
      data = surah.surah.map((verseObj: Record<string, any>) => {
        const { verse, arabic, english } = verseObj;
        return { verse, arabic, english };
      });

      // cache for 30 days
      await this.cache.set(cacheKey, data, this.CACHE_TTL);

      return this.response.success200Response({
        message: 'Successfully retrieved surah',
        data,
      });
    }
  }
}
