import { Module } from '@nestjs/common';
import { EncryptionUtilsService } from './encryption';
import { ResponseUtilsService } from './response';
import { JwtUtilsService } from './jwt';
import { TimeUtilsService } from './time';

import { StringUtilsService } from './string';

@Module({
  imports: [],
  providers: [
    EncryptionUtilsService,
    ResponseUtilsService,
    JwtUtilsService,
    TimeUtilsService,
    StringUtilsService,
  ],
  exports: [
    EncryptionUtilsService,
    ResponseUtilsService,
    JwtUtilsService,
    TimeUtilsService,
    StringUtilsService,
  ],
})
export class UtilsServicesModule {}
