import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { BaseResponseDto } from '../common';

class BaseAuthResponseDto extends BaseResponseDto {}

class JwtTokenPairDto {
  @ApiProperty({
    type: 'string',
  })
  accessToken: string;
  @ApiProperty({
    type: 'string',
  })
  refreshToken: string;
  @ApiProperty({
    type: 'boolean',
    required: false,
    description: 'Whether the user has completed their profile onboarding',
  })
  isProfileComplete?: boolean;
}

class JwtAccessTokenDto {
  @ApiProperty({
    type: 'string',
  })
  accessToken: string;
}

class TokenAuthResponseDto {
  @ApiProperty({
    type: 'string',
  })
  message: string;
  @ApiProperty({
    type: JwtTokenPairDto,
  })
  data: Record<string, any>;
}

class AccessTokenAuthResponseDto {
  @ApiProperty({
    type: JwtAccessTokenDto,
  })
  data: Record<string, any>;
}

export class SignUpResponseDto extends BaseAuthResponseDto {}
export class VerifyAccountResponseDto extends TokenAuthResponseDto {}

export class GoogleOAuth2ResponseDto extends TokenAuthResponseDto {}
export class LoginResponseDto extends TokenAuthResponseDto {}
export class RefreshTokenResponseDto extends AccessTokenAuthResponseDto {}

export class ResetPasswordResponseDto extends BaseAuthResponseDto {}

export class ResendEmailOtpResponseDto extends BaseAuthResponseDto {}
export class RequestPasswordResetOtpResponseDto extends BaseAuthResponseDto {}

export class ResendOtpDto {
  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
