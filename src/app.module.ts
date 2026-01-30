import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import shared from './shared';
import { DatabaseServicesModule } from './common/services/database/database.module';
import { AuthenticationGuard, RefreshGuard } from './common/services/guards';
import { AllExceptionsFilter } from './common/services/exception';
import { WinstonModule } from 'nest-winston';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  QuranModule,
  NotificationModule,
  BibleModule,
  AdminJsModule,
  HealthModule,
  UserModule,
  AuthModule,
  UtilsServicesModule,
  CourseModule,
  JournalModule,
  DevotionalModule,
  ScriptureModule,
  PrayerModule,
  MindfulnessResourceModule,
  MusicLibraryModule,
  QuoteModule,
  GroupModule,
  ChatModule,
  IcellModule,
  QuizModule,
  PaymentModule,
  SecureDModule,
  SubscriptionModule,
} from './modules';

import { CommonModule } from './common/common.module';
import { winstonConfig } from './modules/utils/logger/winston.config';
import { env } from './common';
import { ReligionGuard } from './common/services/guards/religion.guard';
import { RequiresAdminRole } from './common/services/guards/admin-role.guard';

// Create base imports array
const baseImports = [
  UtilsServicesModule,
  DatabaseServicesModule,
  AuthModule,
  UserModule,
  QuranModule,
  NotificationModule,
  BibleModule,
  HealthModule,
  CourseModule,
  JournalModule,
  DevotionalModule,
  ScriptureModule,
  PrayerModule,
  MindfulnessResourceModule,
  MusicLibraryModule,
  QuoteModule,
  GroupModule,
  ChatModule,
  IcellModule,
  QuizModule,
  PaymentModule,
  SecureDModule,
  SubscriptionModule,
  WinstonModule.forRoot(winstonConfig),
  CommonModule, // Global
  EventEmitterModule.forRoot(),
  ...shared,
];

// Add AdminJsModule conditionally
if (env.isDev) {
  baseImports.splice(2, 0, AdminJsModule); // Insert AdminJsModule after DatabaseServicesModule
}

@Module({
  imports: baseImports,
  controllers: [AppController],
  providers: [
    // With this order, the ReligionGuard will be applied after the AuthenticationGuard
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ReligionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RequiresAdminRole,
    },
    {
      provide: APP_GUARD,
      useClass: RefreshGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    AppService,
  ],
})
export class AppModule {}
