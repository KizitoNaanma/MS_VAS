import { MailerModule } from './mailer/mailer.module';
import { MailerService } from './mailer/mailer.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [MailerModule],
  providers: [
    {
      provide: 'Mailer',
      useExisting: MailerService,
    },
  ],
  exports: ['Mailer'],
})
export class EmailProviderModule {}
