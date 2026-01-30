import { Prisma, WithdrawalStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawalRequestDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'number',
    format: 'double',
  })
  amount: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
  })
  reference: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  nibssSessionId: string | null;
  @ApiProperty({
    enum: WithdrawalStatus,
  })
  status: WithdrawalStatus;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  apiResponse: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
