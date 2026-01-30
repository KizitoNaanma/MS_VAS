import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseState } from '../../enum/response';

export class ErrorDtoResponse {
  @ApiProperty({ default: 'Internal Server Error' })
  message: string;
  @ApiProperty({ enum: HttpStatus, default: HttpStatus.INTERNAL_SERVER_ERROR })
  status: HttpStatus;
  @ApiProperty({ enum: ResponseState, default: ResponseState.ERROR })
  state: ResponseState;

  @ApiProperty()
  technicalMessage: string;
}
