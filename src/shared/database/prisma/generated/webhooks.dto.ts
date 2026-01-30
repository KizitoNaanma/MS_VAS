import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class WebhooksDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => Object,
  })
  data: Prisma.JsonValue;
  @ApiProperty({
    type: 'string',
  })
  source: string;
}
