import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { AdminRole, ReligionEnum } from 'src/common/enum';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { PageDto } from '../pagination';
import { SimpleSubscriptionResponseDto } from '../subscription';

export class UpdatePersonalInfoDto {
  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public readonly firstName: string;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public readonly lastName: string;

  @ApiProperty({
    type: 'string',
  })
  @IsEmail()
  @IsOptional()
  public readonly email: string;
}

export class UpdatePasswordDto {
  @ApiProperty({
    type: 'string',
    description: 'Current password',
  })
  @IsString()
  @IsNotEmpty()
  public readonly password: string;

  @ApiProperty({
    type: 'string',
    description: 'New password',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, a number and a special character',
  })
  public readonly newPassword: string;
}

export class ToggleNotificationPreferencesDto {
  @ApiProperty({
    type: 'boolean',
  })
  @IsNotEmpty()
  @IsBoolean()
  public readonly emailNotifications: boolean;

  @ApiProperty({
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  public readonly pushNotifications: boolean;

  @ApiProperty({
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  public readonly dailyNotifications: boolean;

  @ApiProperty({
    type: 'string',
  })
  @ValidateIf((o) => o.dailyNotifications)
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  public readonly preferredNotificationTime: string;
}

export class UpdateUserReligionDto {
  @ApiProperty({
    enum: ReligionEnum,
  })
  @IsNotEmpty()
  @IsEnum(ReligionEnum, {
    message: `Valid options for religion are ${Object.values(ReligionEnum)}`,
  })
  public readonly religion: ReligionEnum;
}

export class UpdateUserProfilePhotoDto {
  @ApiProperty({
    description: 'Profile photo',
    type: 'file',
    format: 'binary',
  })
  public readonly file: Express.Multer.File;
}

export class SimpleUserResponseDto extends PickType(UserEntity, [
  'id',
  'firstName',
  'lastName',
  'profilePhoto',
]) {}

export class StandardUserResponseDto extends PickType(UserEntity, [
  'id',
  'firstName',
  'lastName',
  'profilePhoto',
  'email',
  'phone',
  'dob',
  'religion',
  'lastLogin',
]) {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  createdAt?: Date;

  @ApiProperty({
    type: 'boolean',
    nullable: true,
  })
  isActive?: boolean;
}

export class AdminUserResponseDto extends PickType(UserEntity, [
  'id',
  'firstName',
  'lastName',
  'email',
  'phone',
  'createdAt',
  'adminStatus',
]) {
  @ApiProperty({
    type: 'string',
    enum: AdminRole,
  })
  adminRole: AdminRole;
}

export class StandardUserPaginatedResponseDto extends PageDto<StandardUserResponseDto> {
  @ApiProperty({
    type: () => [StandardUserResponseDto],
  })
  data: StandardUserResponseDto[];
}

export class AdminUserPaginatedResponseDto extends PageDto<AdminUserResponseDto> {
  @ApiProperty({
    type: () => [AdminUserResponseDto],
  })
  data: AdminUserResponseDto[];
}

export class CreateAdminUserDto {
  @ApiProperty({
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    type: 'string',
    enum: AdminRole,
  })
  role: AdminRole;
}

export class AdminRoleResponseDto {
  @ApiProperty({
    type: 'array',
    enum: AdminRole,
  })
  roles: AdminRole[];
}

export class UserWithSubscriptionResponseDto {
  @ApiProperty({
    type: StandardUserResponseDto,
    description: 'User details',
  })
  user: StandardUserResponseDto;

  @ApiProperty({
    type: SimpleSubscriptionResponseDto,
    description: 'Subscription details',
    nullable: true,
  })
  subscription?: SimpleSubscriptionResponseDto;
}

export class NumberOfSubscribersByReligionResponseDto {
  @ApiProperty({
    description: 'Number of christian subscribers',
    type: 'number',
  })
  christians: number;

  @ApiProperty({
    description: 'Number of muslim subscribers',
    type: 'number',
  })
  muslims: number;
}

export class NumberOfActiveSubscribersByReligionResponseDto {
  @ApiProperty({
    description: 'Number of active christian subscribers',
    type: 'number',
  })
  christians: number;

  @ApiProperty({
    description: 'Number of active muslim subscribers',
    type: 'number',
  })
  muslims: number;
}

export class NumberOfCustomersByReligionResponseDto {
  @ApiProperty({
    description: 'Number of customers by religion',
    type: 'number',
  })
  christians: number;

  @ApiProperty({
    description: 'Number of muslim customers',
    type: 'number',
  })
  muslims: number;
}

export class NumberOfMonthlyAcquiredCustomersResponseDto {
  @ApiProperty({
    description: 'Number of monthly acquired christian customers',
    type: 'number',
  })
  christians: number;

  @ApiProperty({
    description: 'Number of monthly acquired muslim customers',
    type: 'number',
  })
  muslims: number;
}

export class UsersStatisticsResponseDto {
  @ApiProperty({
    type: NumberOfSubscribersByReligionResponseDto,
  })
  numberOfSubscribersByReligion: NumberOfSubscribersByReligionResponseDto;

  @ApiProperty({
    type: NumberOfActiveSubscribersByReligionResponseDto,
  })
  numberOfActiveSubscribersByReligion: NumberOfActiveSubscribersByReligionResponseDto;

  @ApiProperty({
    type: NumberOfCustomersByReligionResponseDto,
  })
  numberOfCustomersByReligion: NumberOfCustomersByReligionResponseDto;

  @ApiProperty({
    type: NumberOfMonthlyAcquiredCustomersResponseDto,
  })
  numberOfMonthlyAcquiredCustomers: NumberOfMonthlyAcquiredCustomersResponseDto;

  @ApiProperty({
    type: 'number',
  })
  totalRevenueTillDate: number;

  @ApiProperty({
    type: 'number',
  })
  totalRevenueToday: number;
}

export class UserAvailableQuizAttemptsResponseDto {
  @ApiProperty({
    type: 'number',
  })
  availableQuizAttempts: number;
}
