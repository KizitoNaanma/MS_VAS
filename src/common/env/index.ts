import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { AppEnvironment } from '../enum/environment';

config();
const configService = new ConfigService();

export const JWT_SECRET_KEY = configService.get('JWT_SECRET_KEY');
export const JWT_REFRESH_SECRET_KEY = configService.get(
  'JWT_REFRESH_SECRET_KEY',
);
export const PORT = Number(configService.get('PORT') || process.env.PORT || 4000);
export const GMAIL = configService.get('GMAIL');
export const GOOGLE_CLIENT_ID = configService.get('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = configService.get('GOOGLE_CLIENT_SECRET');
export const GOOGLE_REFRESH_TOKEN = configService.get('GOOGLE_REFRESH_TOKEN');

const sanitizeEnv = (val: any) => (val ? String(val).trim().replace(/^["']|["']$/g, '') : undefined);

export const REDIS_HOST = sanitizeEnv(configService.get('REDIS_HOST') || process.env.REDIS_HOST);
export const REDIS_PORT = sanitizeEnv(configService.get('REDIS_PORT') || process.env.REDIS_PORT);
export const REDIS_USERNAME = sanitizeEnv(configService.get('REDIS_USERNAME') || process.env.REDIS_USERNAME);
export const REDIS_PASSWORD = sanitizeEnv(configService.get('REDIS_PASSWORD') || process.env.REDIS_PASSWORD);
export const REDIS_TLS = sanitizeEnv(configService.get('REDIS_TLS') || process.env.REDIS_TLS);
export const REDIS_URL = sanitizeEnv(configService.get('REDIS_URL') || process.env.REDIS_URL);

export const IQ_BIBLE_RAPID_API_KEY = configService.get(
  'IQ_BIBLE_RAPID_API_KEY',
);

export const IQ_BIBLE_BASE_URL = configService.get('IQ_BIBLE_BASE_URL');

export const ONLINE_QURAN_API_RAPID_API_KEY = configService.get(
  'ONLINE_QURAN_API_RAPID_API_KEY',
);
export const ONLINE_QURAN_API_BASE_URL = configService.get(
  'ONLINE_QURAN_API_BASE_URL',
);

export const S3_BUCKET_NAME = configService.getOrThrow('S3_BUCKET_NAME');
export const S3_BUCKET_USER = configService.getOrThrow('S3_BUCKET_USER');
export const S3_BUCKET_REGION = configService.getOrThrow('S3_BUCKET_REGION');
export const S3_BUCKET_ACCESS_KEY = configService.getOrThrow(
  'S3_BUCKET_ACCESS_KEY',
);
export const S3_BUCKET_SECRET_KEY = configService.getOrThrow(
  'S3_BUCKET_SECRET_KEY',
);
// export const S3_CLOUDFRONT_URL = configService.get('S3_CLOUDFRONT_URL').trim().replace(/\/$/, '');
export const S3_CLOUDFRONT_URL = configService
  .get('S3_CLOUDFRONT_URL')
  ?.trim()
  ?.replace(/\/$/, '');
export const ADMIN_JS_EMAIL = configService.get('ADMIN_JS_EMAIL');

export const ADMIN_JS_PWD = configService.get('ADMIN_JS_PWD');

export const STAGING_SERVER_URL =
  configService.get('STAGING_SERVER_URL') || process.env.STAGING_SERVER_URL;

export const SMTP_HOST = configService.get('SMTP_HOST');
export const SMTP_FROM_EMAIL = configService.get('SMTP_FROM_EMAIL');
export const SMTP_PORT = configService.get('SMTP_PORT');
export const SMTP_USER = configService.get('SMTP_USER');
export const SMTP_PASSWORD = configService.get('SMTP_PASSWORD');
export const SMTP_NO_REPLY_USER_EMAIL = configService.get(
  'SMTP_NO_REPLY_USER_EMAIL',
);

export const SMTP_FROM_NAME = configService.get('SMTP_FROM_NAME');

export const CORS_ORIGINS = configService.get('CORS_ORIGINS')?.split(',') ?? [
  `http://localhost:${PORT}`,
  STAGING_SERVER_URL,
];

// ICELL
export const ICELL_BASE_URL = configService.get('ICELL_BASE_URL')?.trim();
export const ICELL_API_TOKEN = configService.get('ICELL_API_TOKEN');
export const ICELL_SERVICE_CODE = configService.get('ICELL_SERVICE_CODE');
export const ICELL_TEST_API_TOKEN = configService.get('ICELL_TEST_API_TOKEN');
// export const ICELL_TEST_SERVICES: string[] = configService.get('ICELL_TEST_SERVICES')?.split(',');
export const ICELL_TEST_SERVICES: string[] = configService
  .get('ICELL_TEST_SERVICES')
  ?.split(',') ?? [];

// export const ICELL_TEST_MSISDNS: string[] = configService.get('ICELL_TEST_MSISDNS')?.split(',');
export const ICELL_TEST_MSISDNS: string[] = configService
  .get('ICELL_TEST_MSISDNS')
  ?.split(',') ?? [];

// Islamic Portal
export const ISLAMIC_PORTAL_URL =
  configService.getOrThrow('ISLAMIC_PORTAL_URL');
export const CHRISTIAN_PORTAL_URL = configService.getOrThrow(
  'CHRISTIAN_PORTAL_URL',
);
export const WHEEL_PORTAL_URL = configService.get('WHEEL_PORTAL_URL');

// Admins
// export const SUPERADMIN_EMAILS: string[] = configService.get('SUPERADMIN_EMAILS')?.split(',').map((email) => email.trim());
export const SUPERADMIN_EMAILS: string[] = configService
  .get('SUPERADMIN_EMAILS')
  ?.split(',')
  ?.map((email) => email.trim()) ?? [];

// Quiz
export const QUIZ_WINNINGS_POOL_AMOUNT = configService.getOrThrow(
  'QUIZ_WINNINGS_POOL_AMOUNT',
);

// OnionPay
export const ONIONPAY_BASE_URL = configService.getOrThrow('ONIONPAY_BASE_URL');
export const ONIONPAY_SECRET_KEY = configService.getOrThrow(
  'ONIONPAY_SECRET_KEY',
);
export const ONIONPAY_WEBHOOK_SECRET = configService.getOrThrow(
  'ONIONPAY_WEBHOOK_SECRET',
);

export const env = {
  isDev: process.env.APP_ENV === AppEnvironment.DEVELOPMENT,
  isTest: process.env.APP_ENV === AppEnvironment.TESTING,
  isProd: process.env.APP_ENV === AppEnvironment.PRODUCTION,
  isStaging: process.env.APP_ENV === AppEnvironment.STAGING,
  env: process.env.APP_ENV || AppEnvironment.DEVELOPMENT, // fallback to development
  // Keep NODE_ENV separate as it's used by other tools
  nodeEnv: process.env.NODE_ENV,
};
