import {
  GoogleOAuth2Dto,
  RequestPasswordResetOtpDto,
  ResetPasswordDto,
  SignUpDto,
  VerifyAccountDto,
} from 'src/common/dto';

export type ISignUp = SignUpDto;
export type IVerifyAccount = VerifyAccountDto;

export type IGoogleOAuth2 = GoogleOAuth2Dto;
export type IRefreshToken = {
  id: string;
  email: string;
};

export type IRequestPasswordResetOtp = RequestPasswordResetOtpDto;
export type IResetPassword = ResetPasswordDto;
