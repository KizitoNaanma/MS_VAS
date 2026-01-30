import { ApiProperty, PickType } from '@nestjs/swagger';
import { ReligionEnum } from 'src/common';
import {
  UpdatePasswordDto,
  ToggleNotificationPreferencesDto,
} from 'src/common/dto';
import { SimpleBankAccountDto } from 'src/common/dto/bank-account';
import { UserDto } from 'src/shared/database/prisma/generated/user.dto';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { WalletDto } from 'src/shared/database/prisma/generated/wallet.dto';

export type IUpdatePassword = UpdatePasswordDto & {
  user: UserEntity;
  passwordHash: string;
};

export type IGetProfile = {
  id: string;
};

export type IToggleNotificationPreferences =
  ToggleNotificationPreferencesDto & {
    id: string;
  };

export type IUserReligion = {
  userId: string;
  religion: ReligionEnum;
};

export class UserDtoResponse extends PickType(UserDto, [
  'firstName',
  'lastName',
  'fullName',
  'email',
  'phone',
  'dob',
  'religion',
  'emailNotifications',
  'preferredNotificationTime',
  'pushNotifications',
  'dailyNotifications',
  'emailVerified',
  'phoneVerified',
  'profilePhoto',
] as const) {
  @ApiProperty({
    type: WalletDto,
  })
  wallet: WalletDto;
  @ApiProperty({
    type: [SimpleBankAccountDto],
  })
  bankAccounts: SimpleBankAccountDto[];
}

export class UpdatePersonalInfoDtoResponse extends PickType(UserDto, [
  'email',
  'phone',
  'firstName',
  'lastName',
  'emailVerified',
  'phoneVerified',
] as const) {}

export class UpdatePasswordDtoResponse {
  @ApiProperty({
    type: 'string',
  })
  message: 'Password changed successfully';
  @ApiProperty({
    type: 'object',
  })
  data: Record<string, never>;
}

export class ToggleNotificationPreferencesDtoResponse {
  @ApiProperty({
    type: 'string',
  })
  message: 'Notification preference updated';
  @ApiProperty({
    type: 'object',
  })
  data: Record<string, never>;
}
