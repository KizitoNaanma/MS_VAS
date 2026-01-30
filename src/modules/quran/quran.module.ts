import { Module } from '@nestjs/common';
import { QuranController } from './quran.controller';
import { QuranService } from './quran.service';
import { ProviderServicesModule } from 'src/common/services/provider-services/provider.module';
import { CacheServicesModule } from 'src/shared/cache/cache.module';
import { UtilsServicesModule } from 'src/modules/utils/utils.module';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

@Module({
  imports: [
    ProviderServicesModule,
    CacheServicesModule,
    UtilsServicesModule,
    DatabaseServicesModule,
  ],
  controllers: [QuranController],
  providers: [QuranService],
})
export class QuranModule {}
