import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { env, ResponseState } from 'src/common';
const ERROR_MESSAGE = 'An error occurred, please contact support';
const ERROR_MESSAGES = [];

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  errorMessage(error: any) {
    if (error.message) return error.message;
    if (error.responseMessage) return error.responseMessage; // external service
    return ERROR_MESSAGE;
  }

  loggerError(error: any) {
    if (env.isProd || env.isStaging) {
      this.logger.error('====== Error Details =======');
      this.logger.error('Message:', error.message);
      this.logger.error('Stack:', error.stack);
      if (error.response) {
        this.logger.error('Response:', error.response);
      }
      if (error.context) {
        this.logger.error('Context:', error.context);
      }
      this.logger.error('Full error object:', JSON.stringify(error, null, 2));
      this.logger.error('========================');
    } else {
      console.log('====== error =======');
      console.log(error);
      console.log('====== error =======');
    }
  }

  async catch(error: any, host: ArgumentsHost): Promise<void> {
    this.loggerError(error);

    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      error instanceof HttpException
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const response = {
      technicalMessage: error.message,
      message: ERROR_MESSAGES.includes(error.message)
        ? error.message
        : 'An error has occurred, please contact support.',
      status: httpStatus,
      state: ResponseState.ERROR,
    };

    httpAdapter.reply(ctx.getResponse(), response, httpStatus);
  }
}
