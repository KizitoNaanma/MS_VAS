import { Module } from '@nestjs/common';
import { ScriptureController } from './scripture.controller';
import { ScriptureService } from './scripture.service';
import {
  JwtUtilsService,
  ResponseUtilsService,
  TimeUtilsService,
} from '../utils';
import { AdminScripturesService } from './admin/scriptures.service';
import { AdminScripturesController } from './admin/scriptures.controller';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

@Module({
  imports: [DatabaseServicesModule],
  providers: [
    ScriptureService,
    ResponseUtilsService,
    TimeUtilsService,
    JwtUtilsService,
    AdminScripturesService,
  ],
  controllers: [ScriptureController, AdminScripturesController],
})
export class ScriptureModule {}
