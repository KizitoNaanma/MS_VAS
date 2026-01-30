import { Injectable, Logger } from '@nestjs/common';
import { WalletTransactionType } from '@prisma/client';
import { IServiceResponse, ONIONPAY_WEBHOOK_SECRET } from 'src/common';
import { WebhookEvent, WebhookPayloadDto } from 'src/common/dto/onionpay';
import {
  AddBankInformationDto,
  ValidateBankAccountDetailsResponseDto,
  WithdrawalRequestDto,
} from 'src/common/dto/payment';
import { PrismaService } from 'src/common/services/database/prisma';
import { OnionPayService } from 'src/common/services/provider-services/onionpay';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { EncryptionUtilsService } from '../utils';
import { IBankInformation } from 'src/common/types/payment';
import { SimpleBankAccountDto } from 'src/common/dto/bank-account';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    private readonly onionPayService: OnionPayService,
    private readonly prismaService: PrismaService,
    private readonly encryptionService: EncryptionUtilsService,
  ) {}

  private generateTxnRef(): string {
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/[-:T.Z]/g, '')
      .slice(0, 14);
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `RN-${timestamp}-${random}`;
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      // Convert payload to string (if it's an object)
      const payloadString =
        typeof payload === 'string' ? payload : JSON.stringify(payload);

      // Get the webhook secret from environment variables
      const webhookSecret = ONIONPAY_WEBHOOK_SECRET;

      // Generate the expected signature using SHA512
      const expectedSignature = this.encryptionService.sha512WithSecretKey(
        webhookSecret,
        payloadString,
      );

      // Compare signatures (use timing-safe comparison to prevent timing attacks)
      return this.encryptionService.safeCompare(signature, expectedSignature);
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  async addBankInformation(
    addBankInformationDto: AddBankInformationDto,
    user: UserEntity,
  ): Promise<IServiceResponse> {
    const bankInformation = await this.onionPayService.getBankList();

    const bank = bankInformation.find(
      (bank) => bank.bankCode === addBankInformationDto.bankCode,
    );

    if (!bank) {
      return {
        success: false,
        message: 'Bank not found',
      };
    }

    try {
      const userBankInfo = await this.prismaService.bankAccount.create({
        data: {
          userId: user.id,
          bankName: bank.name,
          bankCode: bank.bankCode,
          accountName: addBankInformationDto.accountName,
          accountNumber: addBankInformationDto.accountNumber,
        },
      });

      const allUserBankInfo = await this.prismaService.bankAccount.findMany({
        where: {
          userId: user.id,
        },
      });

      if (allUserBankInfo.length === 1) {
        await this.prismaService.bankAccount.update({
          where: {
            id: userBankInfo.id,
          },
          data: {
            isDefault: true,
          },
        });
      }

      return {
        success: true,
        message: 'Successfully added bank information',
        data: null,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        return {
          success: false,
          message: `Same bank account information already exists`,
        };
      }

      return {
        success: false,
        message: 'Failed to add bank information',
      };
    }
  }

  async validateBankAccountDetails(
    accountNumber: string,
    bankCode: string,
  ): Promise<IServiceResponse<ValidateBankAccountDetailsResponseDto>> {
    const bankAccount = await this.onionPayService.getBankAccountDetails(
      accountNumber,
      bankCode,
    );

    if (bankAccount.success) {
      return {
        success: true,
        message: bankAccount.message,
        data: bankAccount.data,
      };
    }

    return {
      success: false,
      message: bankAccount.message || 'Bank account details not found',
      data: null,
    };
  }

  async getBanks(): Promise<IServiceResponse<IBankInformation[]>> {
    const banks = await this.onionPayService.getBankList();

    return {
      success: true,
      message: 'Successfully retrieved banks',
      data: banks,
    };
  }

  async getBankAccounts(
    user: UserEntity,
  ): Promise<IServiceResponse<SimpleBankAccountDto[]>> {
    const bankAccounts = await this.prismaService.bankAccount.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        accountName: true,
        accountNumber: true,
        bankName: true,
        isDefault: true,
      },
      orderBy: {
        isDefault: 'asc',
      },
    });

    return {
      success: true,
      message: 'Successfully retrieved bank accounts',
      data: bankAccounts,
    };
  }

  async setDefaultBankAccount(
    userId: string,
    bankAccountId: string,
  ): Promise<IServiceResponse> {
    try {
      // Check if the bank account exists and belongs to the user
      const bankAccount = await this.prismaService.bankAccount.findFirst({
        where: {
          id: bankAccountId,
          userId: userId,
        },
      });

      if (!bankAccount) {
        return {
          success: false,
          message: 'Bank account not found',
        };
      }

      // Update all user's bank accounts to set isDefault to false, then set the target one to true
      await this.prismaService.$transaction(async (tx) => {
        // First, set all user's bank accounts to non-default
        await tx.bankAccount.updateMany({
          where: {
            userId: userId,
          },
          data: {
            isDefault: false,
          },
        });

        // Then set the target bank account as default
        await tx.bankAccount.update({
          where: {
            id: bankAccountId,
          },
          data: {
            isDefault: true,
          },
        });
      });

      return {
        success: true,
        message: 'Bank account set as default successfully',
        data: null,
      };
    } catch (error) {
      this.logger.error('Error setting default bank account:', error);
      return {
        success: false,
        message: 'Failed to set bank account as default',
      };
    }
  }

  async deleteBankAccount(
    userId: string,
    bankAccountId: string,
  ): Promise<IServiceResponse> {
    try {
      // Check if the bank account exists and belongs to the user
      const bankAccount = await this.prismaService.bankAccount.findFirst({
        where: {
          id: bankAccountId,
          userId: userId,
        },
      });

      if (!bankAccount) {
        return {
          success: false,
          message: 'Bank account not found',
        };
      }

      // Check if there are any pending withdrawal requests for this bank account
      const pendingWithdrawals =
        await this.prismaService.withdrawalRequest.findFirst({
          where: {
            bankAccountId: bankAccountId,
            status: {
              in: ['PENDING', 'PROCESSING'],
            },
          },
        });

      if (pendingWithdrawals) {
        return {
          success: false,
          message:
            'Cannot delete bank account with pending withdrawal requests',
        };
      }

      await this.prismaService.$transaction(async (tx) => {
        // Delete the bank account
        await tx.bankAccount.delete({
          where: {
            id: bankAccountId,
          },
        });

        // If the deleted account was the default, set another account as default (if any exists)
        if (bankAccount.isDefault) {
          const remainingAccount = await tx.bankAccount.findFirst({
            where: {
              userId: userId,
            },
          });

          if (remainingAccount) {
            await tx.bankAccount.update({
              where: {
                id: remainingAccount.id,
              },
              data: {
                isDefault: true,
              },
            });
          }
        }
      });

      return {
        success: true,
        message: 'Bank account deleted successfully',
        data: null,
      };
    } catch (error) {
      this.logger.error('Error deleting bank account:', error);
      return {
        success: false,
        message: 'Failed to delete bank account',
      };
    }
  }

  async creditUserWallet(
    user: UserEntity,
    amount: number,
    transactionType: WalletTransactionType,
    description: string,
    quizAttemptId?: string,
  ) {
    await this.prismaService.$transaction(async (tx) => {
      const userWallet = await tx.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!userWallet) {
        await tx.wallet.create({
          data: {
            userId: user.id,
            balance: amount,
          },
        });
      }

      await tx.wallet.update({
        where: { id: userWallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      await tx.walletHistory.create({
        data: {
          walletId: userWallet.id,
          amount,
          balanceAfter: userWallet.balance.add(amount),
          balanceBefore: userWallet.balance,
          transactionType,
          description,
          ...(quizAttemptId && { quizAttemptId }),
        },
      });
    });
  }

  async createWithdrawalRequest(
    user: UserEntity,
    withdrawalRequestDto: WithdrawalRequestDto,
  ): Promise<IServiceResponse> {
    const userWallet = await this.prismaService.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!userWallet) {
      return {
        success: false,
        message: 'User wallet not found',
      };
    }

    if (userWallet.balance.lessThanOrEqualTo(withdrawalRequestDto.amount)) {
      return {
        success: false,
        message: 'Insufficient balance',
      };
    }

    const txnResult = await this.prismaService.$transaction(async (tx) => {
      const bankAccount = await tx.bankAccount.findFirst({
        where: {
          userId: user.id,
          isVerified: true,
        },
      });

      if (!bankAccount) {
        return {
          success: false,
          message: 'Bank account not found',
          data: null,
        };
      }

      const withdrawalRequest = await tx.withdrawalRequest.create({
        data: {
          walletId: userWallet.id,
          bankAccountId: bankAccount.id,
          amount: withdrawalRequestDto.amount,
          reference: this.generateTxnRef(),
        },
      });

      return {
        success: true,
        message: 'Withdrawal request created successfully',
        data: {
          withdrawalRequest,
          bankAccount,
        },
      };
    });

    if (!txnResult.success) {
      return {
        success: false,
        message: txnResult.message,
        data: null,
      };
    }

    // Make bank transfer via onionpay
    const bankTransfer = await this.onionPayService.makeBankTransfer({
      accountNumber: txnResult.data.bankAccount.accountNumber,
      bankCode: txnResult.data.bankAccount.bankCode,
      amount: withdrawalRequestDto.amount,
      reference: txnResult.data.withdrawalRequest.reference,
    });

    if (bankTransfer.success) {
      await this.prismaService.withdrawalRequest.update({
        where: { id: txnResult.data.withdrawalRequest.id },
        data: {
          status: 'PROCESSING',
          nibssSessionId: bankTransfer.data.sessionId,
        },
      });
      return {
        success: true,
        message: bankTransfer.message,
        data: null,
      };
    } else {
      await this.prismaService.withdrawalRequest.update({
        where: { id: txnResult.data.withdrawalRequest.id },
        data: {
          status: 'FAILED',
        },
      });
      return {
        success: false,
        message: bankTransfer.message,
        data: null,
      };
    }
  }

  async handleWebhook(payload: WebhookPayloadDto, signature: string) {
    const { event, transaction } = payload;
    const isValidSignature = this.verifyWebhookSignature(payload, signature);

    if (!isValidSignature) {
      this.logger.error('Invalid webhook signature');
      return;
    }

    const withdrawalRequest =
      await this.prismaService.withdrawalRequest.findFirst({
        where: {
          nibssSessionId: transaction.sessionId,
          reference: transaction.reference,
        },
      });

    if (!withdrawalRequest) {
      return {
        success: false,
        message: 'Withdrawal request not found',
      };
    }

    if (event === WebhookEvent.TRANSFER_COMPLETED) {
      await this.prismaService.$transaction(async (tx) => {
        const updatedWithdrawalRequest = await tx.withdrawalRequest.update({
          where: { id: withdrawalRequest.id },
          data: {
            status: 'COMPLETED',
            apiResponse: JSON.stringify(payload),
          },
        });

        const userWallet = await tx.wallet.findUnique({
          where: { id: withdrawalRequest.walletId },
          select: {
            id: true,
            balance: true,
          },
        });

        const updatedUserWallet = await tx.wallet.update({
          where: { id: withdrawalRequest.walletId },
          data: {
            balance: userWallet.balance.sub(withdrawalRequest.amount),
          },
        });

        await tx.walletHistory.create({
          data: {
            walletId: userWallet.id,
            amount: withdrawalRequest.amount,
            balanceAfter: updatedUserWallet.balance,
            balanceBefore: userWallet.balance,
            transactionType: 'WITHDRAWAL',
            description: `Withdrawal request ${updatedWithdrawalRequest.reference} completed`,
            metadata: {
              apiResponse: JSON.stringify(payload),
            },
          },
        });
      });
    }
  }
}
