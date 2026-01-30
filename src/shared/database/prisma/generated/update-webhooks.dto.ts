import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWebhooksDto {
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  data?: Prisma.InputJsonValue;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  source?: string;
}
