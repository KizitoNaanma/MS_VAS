import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWebhooksDto {
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  data: Prisma.InputJsonValue;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  source: string;
}
