import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

import {
  BadRequestException,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { PORT, STAGING_SERVER_URL } from './common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { WebsocketAdapter } from './modules/chat/chat.adapter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    const adapter = new WebsocketAdapter(app);
    await adapter.connectToRedis();
    app.useWebSocketAdapter(adapter);

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
      defaultVersion: '1',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors) => {
          // Map over the errors and extract the messages
          const messages = errors.map((error) =>
            Object.values(error.constraints).join(', '),
          );
          // Join all messages into a single string
          const errorMessage = messages.join('. ');
          // Throw a BadRequestException with the combined error message
          throw new BadRequestException(`Validation failed: ${errorMessage}`);
        },
        stopAtFirstError: true,
        transform: true,
      }),
    );
    app.enableCors({
      origin: '*',
      credentials: true,
    });
    app.use(cookieParser());
    app.enableShutdownHooks();

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Religious Notifications API')
      .setDescription('API for Religious Notifications')
      .setVersion('1.0')
      .addTag('Religious Notifications')
      .addBearerAuth();

    // Prioritize Staging/Render URL if available
    if (STAGING_SERVER_URL) {
      swaggerConfig.addServer(STAGING_SERVER_URL, 'Staging environment');
    }

    // Always keep localhost for local development
    swaggerConfig.addServer(`http://localhost:${PORT}`, 'Local environment');

    const config = swaggerConfig
      .build();

    const customOptions: SwaggerCustomOptions = {
      useGlobalPrefix: true,
      jsonDocumentUrl: '/v1/docs-json',
    };

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('v1/docs', app, documentFactory, customOptions);

    const port = PORT || 4000;
    await app
      .listen(port)
      .then(() => Logger.log(`server running on port ${port}`, 'Bootstrap'));
  } catch (error) {
    Logger.error(`Application failed to start: ${error}`, 'Bootstrap');
    console.error(error);
    // On Render/Production, we want to exit so the platform knows it failed
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }
  }
}
bootstrap();
