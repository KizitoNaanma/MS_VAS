import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  // IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { ReligionEnum } from 'src/common/enum';

export class SignUpDto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  public readonly firstName: string;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  public readonly lastName: string;

  @ApiProperty({
    type: 'string',
  })
  @IsEmail()
  @IsOptional()
  public readonly email: string;

  @ApiProperty({
    type: 'string',
  })
  @IsPhoneNumber('NG')
  @IsNotEmpty()
  public readonly phone: string;

  // @ApiProperty({
  //   type: 'string',
  // })
  // @IsString()
  // @IsNotEmpty()
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message:
  //     'Password must contain at least one uppercase letter, one lowercase letter, a number and a special character',
  // })
  // public readonly password: string;

  @ApiProperty({
    enum: ReligionEnum,
  })
  @IsNotEmpty()
  @IsEnum(ReligionEnum, {
    message: `Valid options for religion are ${Object.values(ReligionEnum)}`,
  })
  public readonly religion: ReligionEnum;
}

export class VerifyAccountDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  public readonly otp: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  public readonly email?: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  public readonly phone?: string;
}

export class LoginDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsNotEmpty()
  @IsOptional()
  @IsEmail()
  public readonly email?: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  public readonly phone?: string;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  public readonly password: string;
}

export class RequestPasswordResetOtpDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  public readonly email?: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  public readonly phone?: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  public readonly email?: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  public readonly phone?: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  public readonly otp: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  public readonly password: string;
}

export class GoogleOAuth2Dto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  public readonly token: string;

  @ApiProperty({
    enum: ReligionEnum,
  })
  @IsNotEmpty()
  @IsEnum(ReligionEnum, {
    message: `Valid options for religion are ${Object.values(ReligionEnum)}`,
  })
  public readonly religion: ReligionEnum;
}

export class RefreshTokensDto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  public readonly refreshToken: string;
}
