import { Module } from '@nestjs/common';
import { AxiosServicesModule } from './axios/axios.module';

@Module({
  imports: [AxiosServicesModule],
  exports: [AxiosServicesModule],
})
export class HttpServicesModule {}
