import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty({
    type: 'string',
  })
  message: string;
  @ApiProperty({
    type: 'object',
  })
  data: Record<string, any>;
}
