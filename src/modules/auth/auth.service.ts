import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import {
  GOOGLE_CLIENT_ID,
  IGoogleOAuth2,
  IRefreshToken,
  IRequestPasswordResetOtp,
  IResetPassword,
  ISignUp,
  IVerifyAccount,
  SignUpTypeEnum,
  TokenTypeEnum,
  env,
  IServiceResponse,
  ReligionEnum,
  LoginDto,
  SUPERADMIN_EMAILS,
  ResendOtpDto,
  PhoneAuthMethodEnum,
} from 'src/common';
import { randomUUID } from 'crypto';
// import { InMemoryCacheService } from 'src/shared/cache/in-memory-cache/in-memory-cache.service';
import { PrismaService } from 'src/common/services/database/prisma';
import {
  EncryptionUtilsService,
  JwtUtilsService,
  StringUtilsService,
  TimeUtilsService,
} from 'src/modules/utils';
import { RedisService } from 'src/shared/cache/redis/redis.service';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import {
  AdminUserStatus,
  Prisma,
  // SubscriptionStatus,
  UserRole,
} from '@prisma/client';
import { generate } from 'generate-password';

import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtUtilsService,
    private readonly time: TimeUtilsService,
    private readonly string: StringUtilsService,
    private readonly encryption: EncryptionUtilsService,
    @Inject('Redis') private readonly cache: RedisService,
    private readonly notificationService: NotificationService,
  ) {}

  private generatePassword(): string {
    return generate({
      length: 9,
      numbers: false,
      uppercase: true,
      lowercase: true,
      excludeSimilarCharacters: true,
    });
  }

  private generateOTPCacheKey(
    email?: string,
    phone?: string,
    suffix: string = 'otp',
  ): string | null {
    if (!email && !phone) {
      return null;
    }

    const identifier = email || phone;
    const type = email ? 'email' : 'phone';

    return `${type}:${identifier}:${suffix}`;
  }

  async signUp(payload: ISignUp): Promise<IServiceResponse> {
    const { firstName, lastName, email, phone, religion } = payload;

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          ...(email && { email }),
          ...(phone && { phone }),
        },
      });

      if (existingUser) {
        const responseMessage = email
          ? 'Email already registered'
          : 'Phone number already registered';
        return {
          success: false,
          message: responseMessage,
          data: null,
        };
      }

      const fullName = `${firstName} ${lastName}`;
      const password = this.generatePassword();
      const passwordHash = await this.encryption.hash(password);

      // create a user
      const user = await this.prisma.user.create({
        data: {
          firstName,
          lastName,
          fullName,
          email,
          phone,
          passwordHash,
          religion: religion || null,
          signUpType: email ? SignUpTypeEnum.EMAIL : SignUpTypeEnum.PHONE,
          roles: [UserRole.USER],
        },
      });

      // create a wallet for the user
      await this.prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });

      const oneHr = this.time.convertToMilliseconds('hours', 1);

      const otpCode = this.string.randomNumbers(6);
      const cacheKey = this.generateOTPCacheKey(email, phone, 'otp');
      const hashed = await this.encryption.hash(String(otpCode));

      await this.cache.set(cacheKey, hashed, oneHr);

      await this.notificationService.sendVerificationCode(
        email,
        phone,
        fullName,
        String(otpCode),
      );

      const responseMessage = email
        ? 'Please check your email for verification code'
        : 'Please check your phone for verification code';

      return {
        success: true,
        message: responseMessage,
        data: env.isProd
          ? null
          : {
              code: otpCode,
            },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  async signUpWithPhoneNumber(
    phoneNumber: string,
    religion: ReligionEnum | null = null,
    authMethod: PhoneAuthMethodEnum = PhoneAuthMethodEnum.MAGIC_LINK,
  ): Promise<{
    user: UserEntity;
    password?: string;
    magicLinkToken?: string;
  }> {
    const password = this.generatePassword();
    const passwordHash = await this.encryption.hash(password);
    const userData: Prisma.UserCreateInput = {
      firstName: '',
      lastName: '',
      fullName: '',
      email: null,
      phone: phoneNumber,
      phoneVerified: true,
      passwordHash,
      religion,
      signUpType: SignUpTypeEnum.PHONE,
      roles: [UserRole.USER],
    };

    // create a user
    const user = await this.prisma.user.create({
      data: userData,
    });

    // create a wallet for the user
    await this.prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });

    // Generate magic link token or return password based on auth method
    if (authMethod === PhoneAuthMethodEnum.MAGIC_LINK) {
      const magicLinkToken = await this.generateMagicLinkToken(user.id);
      return { user, magicLinkToken };
    }

    return { user, password };
  }

  async resendVerificationCode(
    payload: ResendOtpDto,
  ): Promise<IServiceResponse> {
    const { email, phone } = payload;
    if ((email && phone) || (!email && !phone)) {
      throw new BadRequestException(
        'Exactly one of email or phone must be provided.',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: {
        ...(email && { email }),
        ...(phone && { phone }),
      },
    });

    const tenMinutesInMilliSeconds = this.time.convertToMilliseconds(
      'minutes',
      10,
    );

    const otpCode = this.string.randomNumbers(6);
    const cacheKey = this.generateOTPCacheKey(email, phone, 'otp');
    const hashed = await this.encryption.hash(String(otpCode));

    await this.cache.set(cacheKey, hashed, tenMinutesInMilliSeconds);

    await this.notificationService.sendVerificationCode(
      email,
      phone,
      user.fullName,
      String(otpCode),
    );

    return {
      success: true,
      message: 'Verification code sent successfully',
      data: env.isProd
        ? {}
        : {
            code: otpCode,
          },
    };
  }

  async verifyAccount(payload: IVerifyAccount): Promise<IServiceResponse> {
    // This method verifies the user's account using the provided OTP
    // Then logs in the user by generating access and refresh tokens
    const { email, phone, otp } = payload;

    const cacheKey = this.generateOTPCacheKey(email, phone, 'otp');
    const cachedValue = await this.cache.get(cacheKey);

    if (!cachedValue) {
      return {
        success: false,
        message: 'Code is invalid or expired',
      };
    }

    const compareHash = await this.encryption.compareHash(otp, cachedValue);
    if (!compareHash) {
      return {
        success: false,
        message: 'Code is invalid or expired',
      };
    }

    await this.cache.del(cacheKey);

    const { id } = await this.prisma.user.update({
      where: {
        ...(email && { email }),
        ...(phone && { phone }),
      },
      data: {
        emailVerified: true,
      },
    });

    const jwtPayload = {
      id,
      email,
    };

    const oneHr = this.time.convertToSeconds('hours', 1);
    const sevenDays = this.time.convertToSeconds('days', 7);
    const accessToken = await this.jwt.sign(
      jwtPayload,
      oneHr,
      TokenTypeEnum.ACCESS,
    );
    const refreshToken = await this.jwt.sign(
      jwtPayload,
      sevenDays,
      TokenTypeEnum.REFRESH,
    );
    await this.updateRefreshToken(refreshToken, id);

    return {
      success: true,
      message: 'Verified successfully',
      data: {
        accessToken,
        refreshToken,
        cookieOptions: {
          httpOnly: true,
          secure: env.isProd,
          sameSite: 'strict',
          maxAge: sevenDays * 1000, // convert to milliseconds
        },
      },
    };
  }

  async googleOAuth2(payload: IGoogleOAuth2): Promise<IServiceResponse> {
    const { token, religion } = payload;
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const ticketPayload = ticket.getPayload();
    const email = ticketPayload['email'];
    const fullName = ticketPayload['name'];
    let firstName = fullName;
    let lastName = '';

    const names = fullName.split(' ');
    if (names.length === 2) {
      firstName = names[0];
      lastName = names[1];
    }

    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return {
        success: false,
        message: 'User with this email already exists',
      };
    }

    user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        fullName,
        religion,
        roles: [UserRole.USER],
        signUpType: SignUpTypeEnum.GOOGLE,
      },
    });

    // create a wallet for the user
    await this.prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });

    const { id } = user;
    const jwtPayload = {
      id,
      email,
    };

    const oneHr = this.time.convertToSeconds('hours', 1);
    const sevenDays = this.time.convertToSeconds('days', 7);
    const accessToken = await this.jwt.sign(
      jwtPayload,
      oneHr,
      TokenTypeEnum.ACCESS,
    );
    const refreshToken = await this.jwt.sign(
      jwtPayload,
      sevenDays,
      TokenTypeEnum.REFRESH,
    );
    await this.updateRefreshToken(refreshToken, id);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    await this.updateRefreshToken(refreshToken, user.id);

    return {
      success: true,
      message: 'User authenticated successfully',
      data: {
        accessToken,
        refreshToken,
        userId: id,
      },
    };
  }

  async signIn(
    payload: LoginDto,
    xPlatformReligion: string,
  ): Promise<IServiceResponse> {
    const { email, password, phone } = payload;

    if (email === undefined && phone === undefined) {
      return {
        success: false,
        message: 'Email or phone number is required',
      };
    }

    if (email && email.length > 0 && phone && phone.length > 0) {
      return {
        success: false,
        message: 'Email and phone number cannot be provided',
      };
    }

    if (!xPlatformReligion) {
      return {
        success: false,
        message: 'Platform religion is required.',
      };
    }

    const where: Prisma.UserWhereInput = {
      ...(email && { email }),
      ...(phone && { phone }),
    };

    const user = await this.prisma.user.findFirst({
      where,
      select: {
        id: true,
        fullName: true,
        isActive: true,
        religion: true,
        passwordHash: true,
        signUpType: true,
        roles: true,
        email: true,
        phone: true,
        adminStatus: true,
      },
    });

    let signUpMethod: string | null = null;

    if (email && email?.length > 0) {
      signUpMethod = 'email';
    } else if (phone && phone?.length > 0) {
      signUpMethod = 'phone number';
    }

    if (!user) {
      return {
        success: false,
        message: `This ${signUpMethod} is not registered.`,
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        message: 'User is not active.',
      };
    }

    if (user.religion !== xPlatformReligion) {
      return {
        success: false,
        message: 'User religion does not match platform religion.',
      };
    }

    // Perform user updates
    const updateData: Prisma.UserUpdateInput = {
      lastLogin: new Date(),
    };

    // Check if user signed up with phone number and is subscribed
    if (user.signUpType === SignUpTypeEnum.PHONE) {
      // const userSubscription = await this.prisma.subscription.findFirst({
      //   where: {
      //     userId: user.id,
      //     status: SubscriptionStatus.ACTIVE,
      //     OR: [
      //       { endDate: { gt: new Date() } },
      //       { endDate: null }, // ondemand subscriptions
      //     ],
      //   },
      //   orderBy: { createdAt: 'desc' },
      // });

      // if (!userSubscription) {
      //   return {
      //     success: false,
      //     message: 'You need to subscribe to continue.',
      //   };
      // }

      const oneHr = this.time.convertToMilliseconds('hours', 1);

      const otpCode = this.string.randomNumbers(6);
      const cacheKey = this.generateOTPCacheKey(email, phone, 'otp');
      const hashed = await this.encryption.hash(String(otpCode));

      await this.cache.set(cacheKey, hashed, oneHr);

      await this.notificationService.sendVerificationCode(
        undefined,
        phone,
        user.fullName,
        String(otpCode),
      );

      // if (userSubscription.accessCount >= userSubscription.maxAccess) {
      //   return {
      //     success: false,
      //     message: 'You have reached the maximum number of notifications.',
      //   };
      // }

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: updateData,
      });

      return {
        success: true,
        message: 'Verification code sent successfully',
        data: env.isProd ? {} : { code: otpCode },
      };
    }

    // Check if user signed up with email and is an admin
    if (user.signUpType === SignUpTypeEnum.EMAIL) {
      const correctPassword: boolean = await this.encryption.compareHash(
        password,
        user.passwordHash,
      );

      if (!correctPassword) {
        return {
          success: false,
          message:
            'You entered an incorrect login Password, please try again or click on Forgot Password',
        };
      }

      if (
        !(
          user.roles.includes(UserRole.ADMIN) ||
          user.roles.includes(UserRole.SUPERADMIN) ||
          (SUPERADMIN_EMAILS.includes(user.email) &&
            !user.roles.includes(UserRole.SUPERADMIN))
        )
      ) {
        return {
          success: false,
          message: 'You are not authorized to access this platform.',
        };
      }

      // Only set admin status to ACTIVE if the user is an admin and has a null admin status
      // This ensures we only do it once when they first become an admin
      if (
        (user.roles.includes(UserRole.ADMIN) ||
          user.roles.includes(UserRole.SUPERADMIN)) &&
        user.adminStatus === null
      ) {
        updateData.adminStatus = AdminUserStatus.ACTIVE;
      }

      // Only update to SUPERADMIN if not already a SUPERADMIN and email is in the list
      if (
        SUPERADMIN_EMAILS.includes(user.email) &&
        !user.roles.includes(UserRole.SUPERADMIN)
      ) {
        updateData.roles = [UserRole.SUPERADMIN, UserRole.USER];
        updateData.adminStatus = AdminUserStatus.ACTIVE;
      }

      const { id } = user;
      const jwtPayload = {
        id,
        email,
      };

      const oneHr = this.time.convertToSeconds('hours', 1);
      const sevenDays = this.time.convertToSeconds('days', 7);
      const accessToken = await this.jwt.sign(
        jwtPayload,
        oneHr,
        TokenTypeEnum.ACCESS,
      );
      const refreshToken = await this.jwt.sign(
        jwtPayload,
        sevenDays,
        TokenTypeEnum.REFRESH,
      );
      await this.updateRefreshToken(refreshToken, id);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: updateData,
      });

      return {
        success: true,
        message: 'Logged in successfully',
        data: {
          accessToken,
          refreshToken,
          cookieOptions: {
            httpOnly: true,
            secure: env.isProd,
            sameSite: 'strict',
            maxAge: sevenDays * 1000, // convert to milliseconds
          },
        },
      };
    }
  }

  async generatePasswordResetOtp(
    payload: IRequestPasswordResetOtp,
  ): Promise<IServiceResponse> {
    const { email, phone } = payload;
    const user = await this.prisma.user.findUnique({
      where: {
        ...(email && { email }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        fullName: true,
      },
    });
    if (!user) {
      return {
        success: false,
        message: 'User does not exist',
      };
    }

    const cacheKey = this.generateOTPCacheKey(email, phone, 'password-reset');
    const cachedOtp = await this.cache.get(cacheKey);

    if (cachedOtp) {
      return {
        success: false,
        message:
          'An OTP was recently requested. Please wait before requesting again.',
      };
    }

    const otpCode = this.string.randomNumbers(6);
    const fiveMin = this.time.convertToMilliseconds('minutes', 5);
    const hashed = await this.encryption.hash(String(otpCode));
    await this.cache.set(cacheKey, hashed, fiveMin);

    await this.notificationService.sendPasswordResetOtp(
      email,
      phone,
      user.fullName,
      String(otpCode),
    );

    return {
      success: true,
      message: 'Sent successfully',
      data: env.isProd ? {} : { code: otpCode },
    };
  }

  async resetPassword(payload: IResetPassword): Promise<IServiceResponse> {
    const { password, email, phone, otp } = payload;
    const user = await this.prisma.user.findUnique({
      where: {
        ...(email && { email }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
      },
    });
    if (!user) {
      return {
        success: false,
        message: 'User does not exist',
      };
    }

    const cacheKey = this.generateOTPCacheKey(email, phone, 'password-reset');
    const cacheValue = await this.cache.get(cacheKey);

    if (!cacheValue) {
      return {
        success: false,
        message: 'Code is invalid or expired',
      };
    }

    const compareHash = await this.encryption.compareHash(otp, cacheValue);
    if (!compareHash) {
      return {
        success: false,
        message: 'Code is invalid or expired',
      };
    }
    await this.cache.del(cacheValue);

    const passwordHash = await this.encryption.hash(password);
    await this.prisma.user.update({
      where: {
        ...(email && { email }),
        ...(phone && { phone }),
      },
      data: {
        passwordHash,
      },
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async refreshTokens(payload: IRefreshToken): Promise<IServiceResponse> {
    const { id, email } = payload;

    const jwtPayload = {
      id,
      email,
    };

    const oneHr = this.time.convertToSeconds('hours', 1);

    const accessToken = await this.jwt.sign(
      jwtPayload,
      oneHr,
      TokenTypeEnum.ACCESS,
    );

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
      },
    };
  }

  async updateRefreshToken(refreshToken: string, userId: string) {
    const hash = await this.encryption.hash(refreshToken);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hash,
      },
    });
  }

  async logout(userId: string): Promise<IServiceResponse> {
    try {
      // Clear the refresh token in the database
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          refreshToken: '',
        },
      });

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Logout failed',
      };
    }
  }

  /**
   * Generate a magic link token for authentication
   * Token is stored in Redis with 20-minute expiration
   */
  private async generateMagicLinkToken(userId: string): Promise<string> {
    const token = randomUUID();
    const twentyMinutesInMilliseconds = this.time.convertToMilliseconds(
      'minutes',
      20,
    );

    const cacheKey = `magic-link:${token}`;
    await this.cache.set(cacheKey, userId, twentyMinutesInMilliseconds);

    return token;
  }

  /**
   * Generate magic link token for existing users
   * This allows existing users to authenticate via magic link
   */
  async generateMagicLinkForExistingUser(
    userId: string,
  ): Promise<{ token: string }> {
    const token = await this.generateMagicLinkToken(userId);
    return { token };
  }

  /**
   * Verify magic link token and authenticate user
   * Token is deleted after successful verification (one-time use)
   */
  async verifyMagicLink(token: string): Promise<IServiceResponse> {
    if (!token) {
      return {
        success: false,
        message: 'Magic link token is required',
      };
    }

    const cacheKey = `magic-link:${token}`;
    const userId = await this.cache.get(cacheKey);

    if (!userId) {
      return {
        success: false,
        message: 'Invalid or expired magic link token',
      };
    }

    // Delete the token from Redis (one-time use)
    await this.cache.del(cacheKey);

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        religion: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Generate authentication tokens
    const jwtPayload = {
      id: user.id,
      email: user.email,
    };

    const oneHr = this.time.convertToSeconds('hours', 1);
    const sevenDays = this.time.convertToSeconds('days', 7);

    const accessToken = await this.jwt.sign(
      jwtPayload,
      oneHr,
      TokenTypeEnum.ACCESS,
    );

    const refreshToken = await this.jwt.sign(
      jwtPayload,
      sevenDays,
      TokenTypeEnum.REFRESH,
    );

    await this.updateRefreshToken(refreshToken, user.id);

    return {
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken,
        refreshToken,
        cookieOptions: {
          httpOnly: true,
          secure: env.isProd,
          sameSite: 'strict',
          maxAge: sevenDays * 1000, // convert to milliseconds
        },
      },
    };
  }
}
