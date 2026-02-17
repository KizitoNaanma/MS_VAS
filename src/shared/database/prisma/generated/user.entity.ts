import { UserRole, AdminUserStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { JournalEntity } from './journal.entity';
import { CourseEnrollmentEntity } from './courseEnrollment.entity';
import { MessageEntity } from './message.entity';
import { GroupEntity } from './group.entity';
import { GroupMemberEntity } from './groupMember.entity';
import { TrackFavoriteEntity } from './trackFavorite.entity';
import { SubscriptionEntity } from './subscription.entity';
import { TransactionEntity } from './transaction.entity';
import { QuizAttemptEntity } from './quizAttempt.entity';
import { QuizUserAnswerEntity } from './quizUserAnswer.entity';
import { WalletEntity } from './wallet.entity';
import { BankAccountEntity } from './bankAccount.entity';
import { SubscriptionAuditRecordEntity } from './subscriptionAuditRecord.entity';
import { WheelSpinEntity } from './wheelSpin.entity';

export class UserEntity {
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
    type: () => JournalEntity,
    isArray: true,
    required: false,
  })
  journals?: JournalEntity[];
  @ApiProperty({
    type: () => CourseEnrollmentEntity,
    isArray: true,
    required: false,
  })
  courseEnrollments?: CourseEnrollmentEntity[];
  @ApiProperty({
    type: () => MessageEntity,
    isArray: true,
    required: false,
  })
  messages?: MessageEntity[];
  @ApiProperty({
    type: () => GroupEntity,
    isArray: true,
    required: false,
  })
  createdGroups?: GroupEntity[];
  @ApiProperty({
    type: () => GroupMemberEntity,
    isArray: true,
    required: false,
  })
  groupMemberships?: GroupMemberEntity[];
  @ApiProperty({
    type: () => TrackFavoriteEntity,
    isArray: true,
    required: false,
  })
  favourites?: TrackFavoriteEntity[];
  @ApiProperty({
    type: () => SubscriptionEntity,
    isArray: true,
    required: false,
  })
  subscriptions?: SubscriptionEntity[];
  @ApiProperty({
    type: () => TransactionEntity,
    isArray: true,
    required: false,
  })
  transactions?: TransactionEntity[];
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  availableQuizAttempts: number;
  @ApiProperty({
    type: () => QuizAttemptEntity,
    isArray: true,
    required: false,
  })
  quizAttempts?: QuizAttemptEntity[];
  @ApiProperty({
    type: () => QuizUserAnswerEntity,
    isArray: true,
    required: false,
  })
  quizUserAnswers?: QuizUserAnswerEntity[];
  @ApiProperty({
    type: () => WalletEntity,
    required: false,
    nullable: true,
  })
  wallet?: WalletEntity | null;
  @ApiProperty({
    type: () => BankAccountEntity,
    isArray: true,
    required: false,
  })
  bankAccounts?: BankAccountEntity[];
  @ApiProperty({
    type: () => SubscriptionAuditRecordEntity,
    isArray: true,
    required: false,
  })
  SubscriptionAuditRecord?: SubscriptionAuditRecordEntity[];
  @ApiProperty({
    type: () => WheelSpinEntity,
    isArray: true,
    required: false,
  })
  wheelSpins?: WheelSpinEntity[];
}
