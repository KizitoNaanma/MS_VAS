import { CacheServicesModule } from './cache/cache.module';
import { EmailProviderModule } from './email/email.module';
import { HttpServicesModule } from './http/http.module';
import { QueueingServicesModule } from './queueing-services/queueing-services.module';

export default [
  CacheServicesModule,
  HttpServicesModule,
  EmailProviderModule,
  QueueingServicesModule,
];
