import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  IUpdatePassword,
  IEmailService,
  IGetProfile,
  IToggleNotificationPreferences,
  IUserReligion,
  ReligionEnum,
  SMTP_NO_REPLY_USER_EMAIL,
  SMTP_FROM_NAME,
  IServiceResponse,
  StandardUserResponseDto,
  getReligionEnum,
  UpdatePersonalInfoDto,
  UserAvailableQuizAttemptsResponseDto,
  PhoneAuthMethodEnum,
} from 'src/common';
import { PrismaService } from 'src/common/services/database/prisma';
import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';
import { EncryptionUtilsService, mailGenerator } from 'src/modules/utils';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { AuthService } from '../auth/auth.service';

interface UserLookupConfig {
  operation: 'get-only' | 'get-or-create';
  religion?: string | ReligionEnum;
  authMethod?: PhoneAuthMethodEnum;
}

interface UserLookupResult {
  user: StandardUserResponseDto;
  isNewSignup?: boolean;
  password: string | null;
  magicLinkToken?: string | null;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryption: EncryptionUtilsService,
    private readonly s3StorageService: S3StorageService,
    private readonly authService: AuthService,
    @Inject('Mailer') private readonly mailerService: IEmailService,
  ) {}

  /**
   * Generate a unique S3 key for profile photos
   * Prevents too many files in a single directory
   * Maintains better performance for large-scale applications
   * Makes it easier to implement lifecycle policies
   * @param filename - The original filename of the profile photo
   * @returns The S3 key for the profile photo
   */
  private generateProfilePhotoS3Key(filename: string): string {
    // Format: users/profile-photos/YYYY/MM/DD/timestamp-filename
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `users/profile-photos/${year}/${month}/${day}/${Date.now()}-${filename}`;
  }

  async getProfile(payload: IGetProfile): Promise<IServiceResponse> {
    const { id } = payload;
    try {
      const data = await this.prismaService.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          email: true,
          phone: true,
          dob: true,
          religion: true,
          emailNotifications: true,
          dailyNotifications: true,
          preferredNotificationTime: true,
          pushNotifications: true,
          emailVerified: true,
          phoneVerified: true,
          profilePhoto: true,
          wallet: {
            select: {
              balance: true,
            },
          },
          bankAccounts: {
            select: {
              bankName: true,
              accountNumber: true,
              accountName: true,
              isDefault: true,
            },
          },
        },
      });

      return {
        data,
        message: 'Profile data retrieved successfully',
        success: true,
      };
    } catch (error) {
      return {
        message: error.message || 'Profile data retrieval failed',
        success: false,
      };
    }
  }

  async getUser(
    where: Prisma.UserWhereInput,
  ): Promise<StandardUserResponseDto | null> {
    const select = {
      id: true,
      firstName: true,
      lastName: true,
      profilePhoto: true,
      email: true,
      phone: true,
      dob: true,
      religion: true,
      lastLogin: true,
    };
    try {
      const user = await this.prismaService.user.findUnique({
        where: where as Prisma.UserWhereUniqueInput,
        select,
      });

      return user;
    } catch (error) {
      this.logger.error(`Error fetching user: ${error.message}`, error.stack);
      return null;
    }
  }

  async findOrCreateUserByPhone(
    msisdn: string,
    config: UserLookupConfig,
  ): Promise<UserLookupResult | null> {
    let newUserPassword = null;
    let magicLinkToken = null;
    let user = await this.getUser({
      phone: msisdn,
    });

    if (user) {
      // For existing users, generate magic link token if using magic link auth
      const authMethod = config.authMethod || PhoneAuthMethodEnum.MAGIC_LINK;

      if (authMethod === PhoneAuthMethodEnum.MAGIC_LINK) {
        const result = await this.authService.generateMagicLinkForExistingUser(
          user.id,
        );
        magicLinkToken = result.token;
      }

      return {
        user,
        password: newUserPassword,
        magicLinkToken,
      };
    }

    // If operation is 'get-only' and user doesn't exist, return null
    if (config.operation === 'get-only') {
      return null;
    }

    // For 'get-or-create' operation, religion is optional
    const religionEnum = config.religion ? getReligionEnum(config.religion) : null;
    const authMethod = config.authMethod || PhoneAuthMethodEnum.MAGIC_LINK;

    const result = await this.authService.signUpWithPhoneNumber(
      msisdn,
      religionEnum,
      authMethod,
    );

    user = result.user;
    newUserPassword = result.password || null;
    magicLinkToken = result.magicLinkToken || null;

    return {
      user,
      password: newUserPassword,
      magicLinkToken,
    };
  }

  async updatePersonalInfo(
    user: UserEntity,
    payload: UpdatePersonalInfoDto,
  ): Promise<IServiceResponse> {
    const { firstName, lastName, email } = payload;
    try {
      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          email,
          firstName,
          lastName,
          emailVerified: email ? false : undefined,
        },
      });
      return {
        message: 'Personal info updated successfully',
        success: true,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target[0];
        return {
          message: `A user with this ${field} already exists.`,
          success: false,
        };
      }
      this.logger.error(
        `Personal info update error: ${error.message}`,
        error.stack,
      );
      return {
        message: 'Personal information update failed',
        success: false,
      };
    }
  }

  async updatePassword(payload: IUpdatePassword): Promise<IServiceResponse> {
    const { user, password, newPassword, passwordHash } = payload;

    const correctPassword: boolean = await this.encryption.compareHash(
      password,
      passwordHash,
    );

    if (!correctPassword) {
      return {
        success: false,
        message: 'You entered an incorrect login password',
      };
    }

    const newPasswordHash = await this.encryption.hash(newPassword);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    if (user.emailNotifications) {
      const emailContent = {
        body: {
          name: user.fullName,
          intro:
            'You have received this email because a password reset for your account was successful.',
          outro:
            'If you did not request a password reset, please contact support.',
        },
      };

      const html = mailGenerator.generate(emailContent);

      await this.mailerService.send({
        to: user.email,
        subject: 'Password Changed',
        html,
        fromEmail: SMTP_NO_REPLY_USER_EMAIL,
        fromName: SMTP_FROM_NAME,
      });
    }

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }

  async toggleNotificationPreferences(
    payload: IToggleNotificationPreferences,
  ): Promise<IServiceResponse> {
    const {
      id,
      emailNotifications,
      pushNotifications,
      dailyNotifications,
      preferredNotificationTime,
    } = payload;

    try {
      await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          emailNotifications,
          pushNotifications,
          dailyNotifications,
          preferredNotificationTime,
        },
      });

      return {
        message: 'Notification preferences updated successfully',
        success: true,
      };
    } catch (error) {
      return {
        message: error.message || 'Notification preferences update failed',
        success: false,
      };
    }
  }

  async updateUserReligion(payload: IUserReligion): Promise<IServiceResponse> {
    const { userId, religion } = payload;

    try {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          religion,
        },
      });

      return {
        message: 'User religion updated successfully',
        success: true,
      };
    } catch (error) {
      return {
        message: error.message || 'User religion update failed',
        success: false,
      };
    }
  }

  async updateUserProfilePhoto(
    user: UserEntity,
    file: Express.Multer.File,
  ): Promise<IServiceResponse> {
    const filename = this.generateProfilePhotoS3Key(file.originalname);
    const s3Response = await this.s3StorageService.uploadFile(file, filename);

    const fileUrl = await this.s3StorageService.getFileUrl(s3Response.Key);

    if (!s3Response.Key) {
      return {
        message: 'Failed to upload profile photo',
        success: false,
      };
    }

    try {
      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          profilePhoto: fileUrl,
        },
      });

      return {
        message: 'Profile photo updated successfully',
        success: true,
      };
    } catch (error) {
      return {
        message: error.message || 'Profile photo update failed',
        success: false,
      };
    }
  }

  async getUserAvailableQuizAttempts(
    user: UserEntity,
  ): Promise<IServiceResponse<UserAvailableQuizAttemptsResponseDto>> {
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          availableQuizAttempts: true,
        },
      });

      if (!userData) {
        return {
          message: 'User not found',
          data: null,
          success: false,
        };
      }

      return {
        data: {
          availableQuizAttempts: userData.availableQuizAttempts,
        },
        message: 'User available quiz attempts retrieved successfully',
        success: true,
      };
    } catch (error) {
      return {
        message:
          error.message || 'User available quiz attempts retrieval failed',
        success: false,
      };
    }
  }
}
