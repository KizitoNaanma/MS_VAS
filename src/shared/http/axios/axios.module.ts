import { Module } from '@nestjs/common';
import { AxiosService } from './axios.service';
import { IHttpService } from 'src/common';

@Module({
  providers: [
    {
      provide: IHttpService,
      useClass: AxiosService,
    },
  ],
  exports: [IHttpService],
})
export class AxiosServicesModule {}
