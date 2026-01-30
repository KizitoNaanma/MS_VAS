import { Prisma, EnrollmentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CourseEnrollmentDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    enum: EnrollmentStatus,
  })
  status: EnrollmentStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  startedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  lastAccessedAt: Date;
  @ApiProperty({
    description: 'The percentage of the course completed',
    type: 'number',
    format: 'double',
  })
  progress: Prisma.Decimal;
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
