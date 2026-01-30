import { Module } from '@nestjs/common';
import { PrismaService } from '.';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
