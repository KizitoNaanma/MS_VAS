import { PickType } from '@nestjs/swagger';
import { WalletEntity } from 'src/shared/database/prisma/generated/wallet.entity';
import { WalletHistoryEntity } from 'src/shared/database/prisma/generated/walletHistory.entity';

export class WalletResponseDto extends PickType(WalletEntity, [
  'balance',
  'lastUpdated',
]) {}

export class WalletHistoryResponseDto extends PickType(WalletHistoryEntity, [
  'amount',
  'balanceAfter',
  'balanceBefore',
  'transactionType',
  'description',
  'metadata',
  'createdAt',
]) {}

export class SimpleWalletHistoryResponseDto extends PickType(
  WalletHistoryEntity,
  ['amount', 'description', 'transactionType', 'createdAt'],
) {}
