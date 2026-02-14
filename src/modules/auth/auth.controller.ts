import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  GoogleOAuth2Dto,
  GoogleOAuth2ResponseDto,
  IGoogleOAuth2,
  IRefreshToken,
  ISignUp,
  IVerifyAccount,
  LoginDto,
  LoginResponseDto,
  RefreshAuthorization,
  RequestPasswordResetOtpDto,
  ResendEmailOtpResponseDto,
  ResetPasswordDto,
  RequestPasswordResetOtpResponseDto,
  SignUpDto,
  SignUpResponseDto,
  VerifyAccountDto,
  VerifyAccountResponseDto,
  ResetPasswordResponseDto,
  ApiErrorDecorator,
  ResendOtpDto,
  IServiceResponse,
  CurrentUser,
  RefreshTokensDto,
  AuthorizationRequired,
  RefreshTokenResponseDto,
  IResponse,
} from 'src/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseUtilsService } from '../utils';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly services: AuthService,
    private readonly response: ResponseUtilsService,
  ) {}

  @ApiOperation({ summary: 'Sign up' })
  @ApiOkResponse({
    description: 'Sign up successful',
    type: SignUpResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Sign up failed')
  @Post('/sign-up')
  async signUp(@Body() body: SignUpDto, @Res() res: Response) {
    const payload: ISignUp = body;
    const serviceResponse: IServiceResponse =
      await this.services.signUp(payload);
    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Resend email verification code' })
  @ApiOkResponse({
    description: 'Email verification code sent successfully',
    type: ResendEmailOtpResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Failed to send verification code')
  @Post('/resend-verification-code')
  async resendVerificationCode(
    @Body() payload: ResendOtpDto,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.services.resendVerificationCode(payload);
    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Verify account' })
  @ApiOkResponse({
    description: 'Verify account successful',
    type: VerifyAccountResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Verifying account failed')
  @Post('/verify-account')
  async verifyAccount(@Body() body: VerifyAccountDto, @Res() res: Response) {
    const payload: IVerifyAccount = { ...body };
    const serviceResponse = await this.services.verifyAccount(payload);
    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Google OAuth2' })
  @ApiOkResponse({
    description: 'Google OAuth2 successful',
    type: GoogleOAuth2ResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Google OAuth2 failed')
  @Post('/google-oauth2')
  async GoogleOAuth2(@Body() body: GoogleOAuth2Dto, @Res() res: Response) {
    const payload: IGoogleOAuth2 = body;
    const serviceResponse: IServiceResponse =
      await this.services.googleOAuth2(payload);
    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Login failed')
  @Post('/sign-in')
  async signIn(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const serviceResponse: IServiceResponse = await this.services.signIn(
      payload,
    );

    let response: IResponse;
    if (!serviceResponse.success) {
      response = this.response.error400Response(serviceResponse.message);
    } else {
      // Set the refresh token as HTTP-only cookie
      res.cookie(
        'refresh_token',
        serviceResponse.data.refreshToken,
        serviceResponse.data.cookieOptions,
      );

      response = this.response.success200Response({
        message: serviceResponse.message,
        data: {
          accessToken: serviceResponse.data.accessToken,
          refreshToken: serviceResponse.data.refreshToken,
        },
      });
    }
    const { status, ...rest } = response;
    res.status(status).json(rest);
  }

  @ApiOperation({
    summary: 'Refresh tokens',
    description:
      'Update your client-side code to: \n' +
      'Send requests with credentials: "include" to include cookies;\n' +
      'Only manage the access token in memory/storage;\n' +
      "Don't try to manually handle the refresh token.\n" +
      '\n \n' +
      'If you are using axios, you can use the following configuration: \n' +
      'axios.defaults.withCredentials = true;\n' +
      '\n \n' +
      'This approach is more secure because: \n' +
      "The refresh token is HttpOnly and can't be accessed by JavaScript;\n" +
      "It's automatically included in requests to your domain;\n" +
      "You don't need to manually manage sending it in headers;\n" +
      'It reduces the risk of XSS attacks accessing the refresh token.' +
      '\n \n' +
      'NOTE: The refresh token can be sent in the cookies or in the body. \n' +
      'We first check the cookies, if not found, we check the body. \n' +
      'Prefer to use the cookies.',
  })
  @ApiOkResponse({
    description: 'Refresh tokens successful',
    type: RefreshTokenResponseDto,
  })
  @ApiBody({ type: RefreshTokensDto, required: false })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Refresh tokens failed')
  @RefreshAuthorization()
  @Post('/refresh-tokens')
  async refreshTokens(
    @CurrentUser() user: UserEntity,
    @Body() _body: RefreshTokensDto,
    @Res() res: Response,
  ) {
    const { id, email } = user;
    const payload: IRefreshToken = {
      id,
      email,
    };
    const serviceResponse: IServiceResponse =
      await this.services.refreshTokens(payload);

    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiOkResponse({
    description: 'Password reset OTP sent successfully',
    type: RequestPasswordResetOtpResponseDto,
  })
  @ApiErrorDecorator(
    HttpStatus.BAD_REQUEST,
    'Failed to send password reset OTP',
  )
  @Get('/request-password-reset-otp')
  async requestPasswordResetOtp(
    @Query() query: RequestPasswordResetOtpDto,
    @Res() res: Response,
  ) {
    const payload = query;
    const serviceResponse: IServiceResponse =
      await this.services.generatePasswordResetOtp(payload);

    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({
    description: 'Reset password successful',
    type: ResetPasswordResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Reset password failed')
  @Post('/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto, @Res() res: Response) {
    const payload = body;

    const serviceResponse: IServiceResponse =
      await this.services.resetPassword(payload);

    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({
    description: 'Logout successful',
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Logout failed')
  @Post('/logout')
  @ApiBearerAuth()
  @AuthorizationRequired()
  async logout(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { id } = user;
    const serviceResponse = await this.services.logout(id);

    let response: IResponse;
    if (!serviceResponse.success) {
      response = this.response.error400Response(serviceResponse.message);
    } else {
      // Clear the refresh token as HTTP-only cookie
      res.clearCookie('refresh_token');

      response = this.response.success200Response({
        message: serviceResponse.message,
        data: serviceResponse.data,
      });
    }
    const { status, ...rest } = response;
    return res.status(status).json(rest);
  }

  @ApiOperation({
    summary: 'Verify magic link',
    description:
      'Verifies a magic link token and returns authentication tokens. ' +
      'The magic link token is one-time use and expires after 20 minutes.',
  })
  @ApiOkResponse({
    description: 'Magic link verified successfully',
    type: LoginResponseDto,
  })
  @ApiErrorDecorator(
    HttpStatus.BAD_REQUEST,
    'Invalid or expired magic link token',
  )
  @Get('/verify-magic-link')
  async verifyMagicLink(@Query('token') token: string, @Res() res: Response) {
    const serviceResponse: IServiceResponse =
      await this.services.verifyMagicLink(token);

    // Set cookie before sending response
    if (serviceResponse.success && serviceResponse.data?.refreshToken) {
      res.cookie(
        'refresh_token',
        serviceResponse.data.refreshToken,
        serviceResponse.data.cookieOptions,
      );
    }

    return this.response.sendResponse(res, serviceResponse);
  }
}
