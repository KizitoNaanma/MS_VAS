import { Module } from '@nestjs/common';
import { BibleService } from './bible.service';
import { BibleController } from './bible.controller';
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
  providers: [BibleService],
  controllers: [BibleController],
})
export class BibleModule {}
