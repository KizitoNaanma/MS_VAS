import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { ResponseUtilsService, TimeUtilsService } from '../utils';
import { AdminQuotesController } from './admin/quotes.controller';
import { AdminQuotesService } from './admin/quotes.service';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';
import { IcellCoreModule } from 'src/shared/icell-core/icell-core.module';
@Module({
  imports: [DatabaseServicesModule, IcellCoreModule],
  providers: [
    QuoteService,
    TimeUtilsService,
    ResponseUtilsService,
    AdminQuotesService,
  ],
  controllers: [QuoteController, AdminQuotesController],
})
export class QuoteModule {}
