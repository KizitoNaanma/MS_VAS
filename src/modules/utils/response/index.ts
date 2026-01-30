import { Injectable, HttpStatus } from '@nestjs/common';
import {
  IErrorResponse,
  IServiceResponse,
  ISuccessResponse,
  PageDto,
  ResponseState,
} from 'src/common';
import { Response } from 'express';

@Injectable()
export class ResponseUtilsService {
  private readonly defaultMessages = {
    // 200 range
    [HttpStatus.OK]: 'Request successful',
    [HttpStatus.CREATED]: 'Resource successfully created',
    [HttpStatus.ACCEPTED]: 'Request accepted for processing',
    [HttpStatus.NON_AUTHORITATIVE_INFORMATION]:
      'Request successful with non-authoritative information',
    [HttpStatus.NO_CONTENT]: 'Request successful, no content to return',
    [HttpStatus.RESET_CONTENT]: 'Request successful, reset view',
    [HttpStatus.PARTIAL_CONTENT]: 'Partial content delivered',

    // 400 range
    [HttpStatus.BAD_REQUEST]: 'Invalid request parameters',
    [HttpStatus.UNAUTHORIZED]: 'Authentication required',
    [HttpStatus.PAYMENT_REQUIRED]: 'Payment required to access this resource',
    [HttpStatus.FORBIDDEN]: 'Access to this resource is forbidden',
    [HttpStatus.NOT_FOUND]: 'Requested resource not found',
    [HttpStatus.METHOD_NOT_ALLOWED]:
      'HTTP method not allowed for this resource',
    [HttpStatus.NOT_ACCEPTABLE]: 'Requested format not acceptable',
    [HttpStatus.PROXY_AUTHENTICATION_REQUIRED]: 'Proxy authentication required',
    [HttpStatus.REQUEST_TIMEOUT]: 'Request timed out',
    [HttpStatus.CONFLICT]:
      'Request conflicts with current state of the resource',
    [HttpStatus.GONE]: 'Requested resource is no longer available',
    [HttpStatus.LENGTH_REQUIRED]: 'Content length required',
    [HttpStatus.PRECONDITION_FAILED]: 'Precondition for the request failed',
    [HttpStatus.PAYLOAD_TOO_LARGE]: 'Request payload is too large',
    [HttpStatus.URI_TOO_LONG]: 'Request URI is too long',
    [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported media type in request',
    [HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE]:
      'Requested range not satisfiable',
    [HttpStatus.EXPECTATION_FAILED]: 'Server cannot meet request expectations',
    [HttpStatus.I_AM_A_TEAPOT]: "I'm a teapot (April Fools' joke)",
    [HttpStatus.MISDIRECTED]:
      'Request sent to a server unable to produce a response',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unable to process the request',
    [HttpStatus.FAILED_DEPENDENCY]: 'Failed dependency on another request',
    [HttpStatus.PRECONDITION_REQUIRED]: 'Precondition required for the request',
    [HttpStatus.TOO_MANY_REQUESTS]:
      'Too many requests in a given amount of time',
  };

  private getDefaultMessage(status: HttpStatus): string {
    return this.defaultMessages[status] || 'Unknown status';
  }

  public sendResponse(
    res: Response,
    serviceResponse: IServiceResponse,
    options?: {
      successResponseFn?: keyof Pick<
        ResponseUtilsService,
        | 'success200Response'
        | 'success201Response'
        | 'success202Response'
        | 'success204Response'
      >;
      errorResponseFn?: keyof Pick<
        ResponseUtilsService,
        | 'error400Response'
        | 'error401Response'
        | 'error403Response'
        | 'error404Response'
        | 'error409Response'
        | 'error422Response'
        | 'error429Response'
        | 'error500Response'
      >;
    },
  ): Response {
    if (!serviceResponse.success) {
      const errorFn = options?.errorResponseFn || 'error400Response';
      const errorResponse = this[errorFn](serviceResponse.message);
      const { status, ...rest } = errorResponse;
      return res.status(status).json(rest);
    }

    const successFn = options?.successResponseFn || 'success200Response';

    // Check if serviceResponse.data is an instance of PageDto
    const isPageDto =
      serviceResponse.data && serviceResponse.data instanceof PageDto;

    const successResponse = this[successFn]({
      message: serviceResponse.message,
      data: isPageDto ? serviceResponse.data.data : serviceResponse.data,
      ...(isPageDto &&
        serviceResponse.data.meta && { meta: serviceResponse.data.meta }),
    });

    const { status, ...rest } = successResponse;
    return res.status(status).json(rest);
  }

  public success201Response(payload: ISuccessResponse): ISuccessResponse {
    return {
      ...payload,
      message: payload.message || this.getDefaultMessage(HttpStatus.CREATED),
      state: ResponseState.SUCCESS,
      status: HttpStatus.CREATED,
    };
  }
  public success200Response(payload: ISuccessResponse): ISuccessResponse {
    return {
      ...payload,
      message: payload.message || this.getDefaultMessage(HttpStatus.OK),
      state: ResponseState.SUCCESS,
      status: HttpStatus.OK,
    };
  }

  public success202Response(payload: ISuccessResponse): ISuccessResponse {
    return {
      ...payload,
      message: payload.message || this.getDefaultMessage(HttpStatus.ACCEPTED),
      state: ResponseState.SUCCESS,
      status: HttpStatus.ACCEPTED,
    };
  }

  public success204Response(payload: ISuccessResponse): ISuccessResponse {
    return {
      ...payload,
      message: payload.message || this.getDefaultMessage(HttpStatus.NO_CONTENT),
      state: ResponseState.SUCCESS,
      status: HttpStatus.NO_CONTENT,
    };
  }
  public errorResponse(payload: IErrorResponse): IErrorResponse {
    return {
      ...payload,
      message:
        payload.message || this.getDefaultMessage(HttpStatus.BAD_REQUEST),
      state: ResponseState.ERROR,
      error: null,
    };
  }

  /**
   * Most of your error response would probably be a 400 status code error
   *
   * @param message
   * @returns
   */
  public error400Response(message: string): IErrorResponse {
    return {
      message: message || this.getDefaultMessage(HttpStatus.BAD_REQUEST),
      state: ResponseState.ERROR,
      error: null,
      status: HttpStatus.BAD_REQUEST,
    };
  }

  public error401Response(message: string): IErrorResponse {
    return {
      message: message || this.getDefaultMessage(HttpStatus.UNAUTHORIZED),
      state: ResponseState.ERROR,
      error: null,
      status: HttpStatus.UNAUTHORIZED,
    };
  }

  public error403Response(message: string): IErrorResponse {
    return {
      message: message || this.getDefaultMessage(HttpStatus.FORBIDDEN),
      state: ResponseState.ERROR,
      error: null,
      status: HttpStatus.FORBIDDEN,
    };
  }

  public error404Response(message: string): IErrorResponse {
    return {
      message: message || this.getDefaultMessage(HttpStatus.NOT_FOUND),
      state: ResponseState.ERROR,
      error: null,
      status: HttpStatus.NOT_FOUND,
    };
  }

  public error409Response(message: string): IErrorResponse {
    return {
      message: message || this.getDefaultMessage(HttpStatus.CONFLICT),
      state: ResponseState.ERROR,
      error: null,
      status: HttpStatus.CONFLICT,
    };
  }

  public error422Response(message: string): IErrorResponse {
    return {
      message:
        message || this.getDefaultMessage(HttpStatus.UNPROCESSABLE_ENTITY),
      state: ResponseState.ERROR,
      error: null,
      status: HttpStatus.UNPROCESSABLE_ENTITY,
    };
  }

  public error429Response(message: string): IErrorResponse {
    return {
      message: message || this.getDefaultMessage(HttpStatus.TOO_MANY_REQUESTS),
      state: ResponseState.ERROR,
      error: null,
      status: HttpStatus.TOO_MANY_REQUESTS,
    };
  }

  public error500Response(message: string): IErrorResponse {
    return {
      message:
        message || this.getDefaultMessage(HttpStatus.INTERNAL_SERVER_ERROR),
      state: ResponseState.ERROR,
      error: null,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  /**
   * Generic error response function that handles different HTTP status codes
   * @param status HTTP status code for the error
   * @param message Custom error message (optional)
   * @returns IErrorResponse with appropriate error status and message
   */
  public errorResponseWithStatus(
    status: HttpStatus,
    message?: string,
  ): IErrorResponse {
    return {
      message: message || this.getDefaultMessage(status),
      state: ResponseState.ERROR,
      error: null,
      status: status,
    };
  }
}
