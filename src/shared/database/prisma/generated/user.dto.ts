import { UserRole, AdminUserStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  lastLogin: Date;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  email: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  phone: string | null;
  @ApiProperty({
    type: 'string',
  })
  firstName: string;
  @ApiProperty({
    type: 'string',
  })
  lastName: string;
  @ApiProperty({
    type: 'string',
  })
  fullName: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  dob: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  religion: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  profilePhoto: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  passwordHash: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  pinHash: string | null;
  @ApiProperty({
    type: 'string',
  })
  refreshToken: string;
  @ApiProperty({
    type: 'boolean',
  })
  emailVerified: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  phoneVerified: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isProfileComplete: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  ageConfirmed: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  preferredNotificationTime: Date | null;
  @ApiProperty({
    type: 'boolean',
  })
  dailyNotifications: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  emailNotifications: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  smsNotifications: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  pushNotifications: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isActive: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deactivatedAt: Date | null;
  @ApiProperty({
    type: 'string',
  })
  signUpType: string;
  @ApiProperty({
    isArray: true,
    enum: UserRole,
  })
  roles: UserRole[];
  @ApiProperty({
    enum: AdminUserStatus,
    nullable: true,
  })
  adminStatus: AdminUserStatus | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  availableQuizAttempts: number;
}
