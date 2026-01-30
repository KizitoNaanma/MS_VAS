import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseState } from '../../enum/response';

export class StandardSuccessDtoResponse {
  @ApiProperty({ default: 'Success' })
  message: string;
  @ApiProperty({ enum: HttpStatus, default: HttpStatus.OK })
  status: HttpStatus;
  @ApiProperty({ enum: ResponseState, default: ResponseState.SUCCESS })
  state: ResponseState;
}
