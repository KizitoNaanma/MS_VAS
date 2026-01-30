import { Module } from '@nestjs/common';
import { HttpServicesModule } from 'src/shared/http/http.module';
import { UtilsServicesModule } from 'src/modules/utils/utils.module';
import { OnlineQuranApiServices } from './online-quran-api';
import { IqBibleServices } from './iq-bible';
import { OnionPayService } from './onionpay';
import { CacheServicesModule } from 'src/shared/cache/cache.module';

@Module({
  imports: [HttpServicesModule, UtilsServicesModule, CacheServicesModule],
  providers: [IqBibleServices, OnlineQuranApiServices, OnionPayService],
  exports: [IqBibleServices, OnlineQuranApiServices, OnionPayService],
})
export class ProviderServicesModule {}
