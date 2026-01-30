import { ApiProperty, PickType } from '@nestjs/swagger';
import { SubscriptionEntity } from 'src/shared/database/prisma/generated/subscription.entity';
import { IcellProductResponseDto } from '../icell';
import { WalletResponseDto } from '../wallet';

export class SimpleSubscriptionResponseDto extends PickType(
  SubscriptionEntity,
  [
    'id',
    'productId',
    'productName',
    'serviceId',
    'serviceName',
    'startDate',
    'endDate',
    'maxAccess',
    'accessCount',
    'status',
  ],
) {}

export class StoreResponseDto {
  @ApiProperty({
    description: 'Products in the store',
    type: [IcellProductResponseDto],
  })
  products: IcellProductResponseDto[];
}

export class StoreAndWalletResponseDto {
  @ApiProperty({
    description: 'Products in the store',
    type: [IcellProductResponseDto],
  })
  products: IcellProductResponseDto[];

  @ApiProperty({
    description: 'Current subscription details',
    type: SimpleSubscriptionResponseDto,
  })
  subscription: SimpleSubscriptionResponseDto;

  @ApiProperty({
    description: 'User wallet details',
    type: WalletResponseDto,
  })
  wallet: WalletResponseDto;
}
