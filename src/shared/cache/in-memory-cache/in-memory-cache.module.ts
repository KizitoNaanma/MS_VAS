import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { InMemoryCacheService } from './in-memory-cache.service';

@Module({
  imports: [CacheModule.register()],
  providers: [InMemoryCacheService],
  exports: [InMemoryCacheService],
})
export class InMemoryCacheServiceModule {}
