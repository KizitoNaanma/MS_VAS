import { Module } from '@nestjs/common';

import { IcellSmsHandler } from './handlers/icell-sms.handler';
import { IcellDatasyncHandler } from './handlers/icell-datasync.handler';
import { IcellProductsService } from './services/icell-products.service';
import { IcellClient } from './services/icell.client';
import { IcellLoggerService } from './services/icell-logger.service';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

@Module({
  imports: [DatabaseServicesModule],
  providers: [
    IcellProductsService,
    IcellClient,
    IcellSmsHandler,
    IcellDatasyncHandler,
    IcellLoggerService,
  ],
  exports: [
    IcellProductsService,
    IcellClient,
    IcellSmsHandler,
    IcellDatasyncHandler,
    IcellLoggerService,
  ],
})
export class IcellCoreModule {}
