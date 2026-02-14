import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database/prisma';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { SubscriptionStatus, WalletTransactionType } from '@prisma/client';
import { IServiceResponse } from 'src/common';
import { PaymentService } from '../payment/payment.service';
import { WheelSpinResultResponseDto, WheelSpinStatusResponseDto } from './dto/wheel-of-fortune.dto';

@Injectable()
export class WheelOfFortuneService {
  private readonly logger = new Logger(WheelOfFortuneService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async getStatus(user: UserEntity): Promise<IServiceResponse<WheelSpinStatusResponseDto>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
        productName: { contains: 'WHEEL', mode: 'insensitive' }, // Simple check for now
        OR: [{ endDate: { gt: new Date() } }, { endDate: null }],
      },
    });

    const spinsToday = await this.prisma.wheelSpin.count({
      where: {
        userId: user.id,
        spunAt: { gte: today },
      },
    });

    return {
      success: true,
      message: 'Status fetched successfully',
      data: {
        hasSubscription: !!subscription,
        spinsToday,
        canSpin: !!subscription, // Basic logic: if subscribed, can spin
      },
    };
  }

  async spin(user: UserEntity): Promise<IServiceResponse<WheelSpinResultResponseDto>> {
    const status = await this.getStatus(user);
    if (!status.data.canSpin) {
      return {
        success: false,
        message: 'You need an active subscription to spin the wheel.',
      };
    }

    // Game Logic: Simple randomized reward
    // In production, this would be more sophisticated (odds, prize pool, etc.)
    const winProbability = 0.2; // 20% chance of winning
    const isWin = Math.random() < winProbability;
    let amountWon = 0;
    let message = 'Better luck next time!';

    if (isWin) {
      const prizes = [50, 100, 200, 500];
      amountWon = prizes[Math.floor(Math.random() * prizes.length)];
      message = `Congratulations! You won N${amountWon}.`;
    }

    // Record the spin
    await this.prisma.wheelSpin.create({
      data: {
        userId: user.id,
        isWin,
        amountWon,
        rewardType: isWin ? 'CASH' : null,
      },
    });

    // Credit wallet if win
    if (isWin && amountWon > 0) {
      try {
        await this.paymentService.creditUserWallet(
          user,
          amountWon,
          WalletTransactionType.WHEEL_REWARD,
          'Wheel of Fortune Reward',
        );
      } catch (error) {
        this.logger.error(`Failed to credit user wallet after wheel win: ${error.message}`);
        // We still return the win, but log the error for manual intervention or retry
      }
    }

    return {
      success: true,
      message: 'Spin completed',
      data: {
        isWin,
        amountWon,
        rewardType: isWin ? 'CASH' : null,
        message,
      },
    };
  }
}
