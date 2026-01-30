import { Module } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JwtUtilsService, ResponseUtilsService } from 'src/modules/utils';
import { JournalController } from './journal.controller';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

@Module({
  imports: [DatabaseServicesModule],
  controllers: [JournalController],
  providers: [JournalService, ResponseUtilsService, JwtUtilsService],
})
export class JournalModule {}
