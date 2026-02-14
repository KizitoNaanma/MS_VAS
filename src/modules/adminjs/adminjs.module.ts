import { Logger, Module } from '@nestjs/common';
import {
  ADMIN_JS_EMAIL,
  ADMIN_JS_PWD,
  env,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_TLS,
  REDIS_USERNAME,
  REDIS_URL,
} from 'src/common';

import { DatabaseServicesModule } from 'src/common/services/database/database.module';

import { PrismaClient } from '@prisma/client';
import { ResourceBuilder } from './resourceBuilder';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const authenticate = async (email: string, password: string) => {
  if (email === ADMIN_JS_EMAIL && password === ADMIN_JS_PWD) {
    return Promise.resolve(ADMIN_JS_EMAIL);
  }
  return null;
};

const consoleLogRedisConnectionError = (err: any) => {
  Logger.error(
    `AdminJS Redis connection error occurred: ${err.message}`,
    'AdminJS Redis',
  );

  // Check for READONLY error which indicates replica sync issues
  const targetError = 'READONLY';
  if (err.message.includes(targetError)) {
    Logger.warn(
      'Redis READONLY error detected - attempting reconnection',
      'AdminJS Redis',
    );
    return true;
  }
  return false;
};

const redisClient = createClient({
  ...(REDIS_URL
    ? { url: REDIS_URL }
    : {
        username: String(REDIS_USERNAME),
        password: String(REDIS_PASSWORD),
        socket: {
          host: String(REDIS_HOST),
          port: Number(REDIS_PORT),
          tls: REDIS_TLS === 'true',
          rejectUnauthorized: false,
        },
      }),
  socket: {
    ...(REDIS_URL
      ? {}
      : {
          host: String(REDIS_HOST),
          port: Number(REDIS_PORT),
        }),
    tls: String(REDIS_TLS) === 'true',
    rejectUnauthorized: false,
    reconnectStrategy(retries, cause) {
      if (cause) {
        Logger.error(
          `Redis reconnection error: ${cause}`,
          'AdminJS Redis Client',
        );
      }
      if (retries > 3) {
        return new Error('Failed to connect to Redis');
      }
      return Math.min(retries * 50, 2000);
    },
  },
  pingInterval: 120000,
});

redisClient.connect().catch(consoleLogRedisConnectionError);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'adminjs:',
});

@Module({
  imports: [
    Promise.all([
      import('adminjs'),
      import('@adminjs/nestjs'),
      import('@adminjs/prisma'),
    ]).then(
      ([
        { AdminJS },
        { AdminModule },
        { Database, Resource, getModelByName },
      ]) => {
        AdminJS.registerAdapter({ Database, Resource });

        return AdminModule.createAdminAsync({
          imports: [DatabaseServicesModule],
          useFactory: () => {
            const prisma = new PrismaClient();
            return {
              adminJsOptions: {
                rootPath: '/admin',
                branding: {
                  logo: 'https://religious-notification-data.s3.eu-west-1.amazonaws.com/assets/religious-notifs-logo.png',
                  companyName: 'Religious Notifications',
                  favicon:
                    'https://religious-notification-data.s3.eu-west-1.amazonaws.com/assets/religious-notifs-logo.png',
                },
                resources: new ResourceBuilder(prisma)
                  .addResource(getModelByName('Album'))
                  .addResource(getModelByName('Artist'))
                  .addResource(getModelByName('CourseCategory'))
                  .addResource(getModelByName('CourseTopic'))
                  .addResource(getModelByName('CourseLesson'))
                  .addResource(getModelByName('CourseAuthor'))
                  .addResource(getModelByName('Course'))
                  .addResource(getModelByName('CourseEnrollment'))
                  .addResource(getModelByName('CourseLessonProgress'))
                  .addResource(getModelByName('DailyPrayer'))
                  .addResource(getModelByName('DailyScripture'))
                  .addResource(getModelByName('DailyDevotional'))
                  .addResource(getModelByName('Journal'))
                  .addResource(getModelByName('MindfulnessResourceCategory'))
                  .addResource(getModelByName('MindfulnessResource'))
                  .addResource(getModelByName('Quote'))
                  .addResource(getModelByName('Religion'))
                  .addResource(getModelByName('Theme'))
                  .addResource(getModelByName('Track'))
                  .addResource(getModelByName('QuizSet'))
                  .addResource(getModelByName('QuizQuestion'))
                  .addResource(getModelByName('QuizAnswerOption'))
                  .addResource(getModelByName('QuizAttempt'))
                  .addResource(getModelByName('QuizUserAnswer'))
                  .addResource(getModelByName('Wallet'))
                  .addResource(getModelByName('WalletHistory'))
                  .addResource(getModelByName('WithdrawalRequest'))
                  .addResource(getModelByName('BankAccount'))
                  .addResource(getModelByName('Subscription'))
                  .addResource(getModelByName('Transaction'))
                  .addResource(getModelByName('User'))
                  .addResource(getModelByName('Webhooks'))
                  .build(),
              },
              auth: {
                authenticate,
                cookieName: 'adminjs',
                cookiePassword: 'secret',
              },
              sessionOptions: {
                store: redisStore,
                resave: false,
                saveUninitialized: false,
                secret: 'secret',
                cookie: {
                  httpOnly: true,
                  secure: env.isProd,
                  maxAge: 24 * 60 * 60 * 1000, // 24 hours
                },
              },
            };
          },
        });
      },
    ),
  ],
})
export class AdminJsModule {}
