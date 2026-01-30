import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseState } from 'src/common';
import { ErrorDtoResponse } from 'src/common/dto';
export function ApiErrorDecorator(
  statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  message: string = 'Internal Server Error',
  description?: string,
  options?: ApiResponseOptions,
) {
  return applyDecorators(
    ApiResponse({
      ...options,
      status: statusCode,
      description: description,
      schema: {
        default: {
          message,
          statusCode,
          state: ResponseState.ERROR,
          technicalMessage: '',
        },
        type: getSchemaPath(ErrorDtoResponse),
      },
    }),
  );
}
