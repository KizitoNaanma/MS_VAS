import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseState } from 'src/common';
import { StandardSuccessDtoResponse } from 'src/common/dto';
export function ApiStandardSuccessDecorator(
  message: string = 'Success',
  description?: string,
  options?: ApiResponseOptions,
  statusCode: HttpStatus = HttpStatus.OK,
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
          state: ResponseState.SUCCESS,
        },
        type: getSchemaPath(StandardSuccessDtoResponse),
      },
    }),
  );
}
