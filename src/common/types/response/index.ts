import { HttpStatus } from '@nestjs/common';
import { ResponseState } from 'src/common/enum';

export type ISuccessResponse = {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  data: Record<string, any> | string | number;
  status?: HttpStatus;
  state?: ResponseState;
  meta?: {
    page: number;
    pageSize: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type IErrorResponse = {
  status?: HttpStatus;
  message: string;
  error?: null;
  state?: ResponseState;
};
export type IResponse = ISuccessResponse | IErrorResponse;

export type IServiceResponse<T = Record<string, any>> = {
  success: boolean;
  message?: string;
  data?: T;
  status?: HttpStatus;
  meta?: {
    page: number;
    pageSize: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};
