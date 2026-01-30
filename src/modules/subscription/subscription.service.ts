import { Injectable, Logger } from '@nestjs/common';
import { OperationType, PaymentStatus, Religion } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from 'src/common/services/database/prisma';
import { IcellDatasyncRequestDto } from 'src/common/dto/icell';
import { UserService } from '../user/user.service';
import { IcellProductsService } from '../../shared/icell-core/services/icell-products.service';
import { IcellProductType, IcellServiceType } from 'src/common/types/product';
import {
  IServiceResponse,
  ReligionEnum,
  StandardUserResponseDto,
  PhoneAuthMethodEnum,
} from 'src/common';
import { TransactionEntity } from 'src/shared/database/prisma/generated/transaction.entity';
import { addDays, startOfDay, subDays } from 'date-fns';
import { SubscriptionEntity } from 'src/shared/database/prisma/generated/subscription.entity';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { StoreAndWalletResponseDto } from 'src/common/dto/subscription';
import { IcellDatasyncHandler } from 'src/shared/icell-core/handlers/icell-datasync.handler';
import { NotificationService } from '../notification/notification.service';

const MAXIMUM_CONTENT_ACCESS_LIMIT = 9999999;

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly icellProductsService: IcellProductsService,
    private readonly icellDatasyncHandler: IcellDatasyncHandler,
    private readonly notificationService: NotificationService,
  ) {}

  private generateTransactionId(): string {
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    return `RN${timestamp}${randomNumber}`;
  }

  private purifyProductId(input: string): string {
    return input.split('_')[0];
  }

  private validateAndFormatAmount(amount: string | number): string {
    // Check if amount is not null/undefined
    if (!amount) {
      throw new Error('Amount is required');
    }

    // Convert to string and trim whitespace
    const amountStr = amount.toString().trim();

    // Remove any existing commas
    const cleanAmount = amountStr.replace(/,/g, '');

    // Ensure exactly 2 decimal places
    const formattedAmount = parseFloat(cleanAmount).toFixed(2);

    return formattedAmount;
  }

  private async handleSubscriptionActivation(
    txnRef: string,
    user: StandardUserResponseDto,
    product: IcellProductType,
    service: IcellServiceType,
    dataSyncRequest: IcellDatasyncRequestDto,
    transaction: Pick<TransactionEntity, 'id'>,
  ): Promise<SubscriptionEntity> {
    const validityDays = parseInt(product.validityDays || '0');

    const operationType =
      this.icellDatasyncHandler.determineDatasyncOperationType(
        dataSyncRequest.operationId,
      );
    if (
      !operationType ||
      !Object.values(OperationType).includes(operationType)
    ) {
      throw new Error(`Invalid operationId: ${dataSyncRequest.operationId}`);
    }

    // Check for existing active subscription for the same product and service
    const existingSubscription =
      await this.prismaService.subscription.findFirst({
        where: {
          userId: user.id,
          productId: product.id,
          serviceId: service.id,
          status: SubscriptionStatus.ACTIVE,
          OR: [
            { endDate: { gt: new Date() } },
            { endDate: null }, // ondemand subscriptions
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

    if (existingSubscription) {
      // Deactivate the existing subscription
      await this.prismaService.subscription.update({
        where: { id: existingSubscription.id },
        data: { status: SubscriptionStatus.REPLACED },
      });
    }

    const subscription = await this.prismaService.subscription.create({
      data: {
        userId: user.id,
        userPhoneNumber: dataSyncRequest.callingParty,
        txnRef,
        transactionId: transaction.id,
        productId: product.id,
        productName: product.name,
        sequenceNo: dataSyncRequest.sequenceNo,
        amount: new Decimal(
          this.validateAndFormatAmount(dataSyncRequest.chargeAmount),
        ),
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.type,
        operationType,
        startDate: new Date(),
        endDate: validityDays > 0 ? addDays(new Date(), validityDays) : null,
        maxAccess: MAXIMUM_CONTENT_ACCESS_LIMIT,
        status:
          dataSyncRequest.resultCode === '0'
            ? SubscriptionStatus.ACTIVE
            : SubscriptionStatus.FAILED,
        mobileNetworkOperator: 'MTN',
        aggregator: 'ICELL',
      },
    });

    // Add quiz attempts for the user (always additive to existing attempts)
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        availableQuizAttempts: {
          increment: this.icellProductsService.getProductQuizAttempts(product),
        },
      },
    });

    return subscription;
  }

  private async deactivateSubscription(
    user: StandardUserResponseDto,
    product: IcellProductType,
    service: IcellServiceType,
  ): Promise<void> {
    // Find user first active subscription
    const activeSubscription = await this.prismaService.subscription.findFirst({
      where: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
        productId: product.id,
        productName: product.name,
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.type,
      },
    });

    if (activeSubscription) {
      await this.prismaService.subscription.update({
        where: { id: activeSubscription.id },
        data: { status: SubscriptionStatus.CANCELLED },
      });
    }
  }

  private async expireSubscription(subscription: SubscriptionEntity) {
    await this.prismaService.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.EXPIRED },
    });
  }

  private async createTransaction(
    txnRef: string,
    user: StandardUserResponseDto,
    product: IcellProductType,
    dataSyncRequest: IcellDatasyncRequestDto,
  ) {
    const transaction = await this.prismaService.transaction.create({
      data: {
        userId: user.id,
        amount: new Decimal(
          this.validateAndFormatAmount(dataSyncRequest.chargeAmount),
        ),
        currency: product.currency,
        status: PaymentStatus.COMPLETED,
        productId: product.id,
        productName: product.name,
        channel: dataSyncRequest.bearerId,
        reference: txnRef,
      },
      select: {
        id: true,
      },
    });

    return transaction;
  }

  async processUserSubscription(dataSyncRequest: IcellDatasyncRequestDto) {
    const { callingParty: msisdn, requestedPlan: _productId } = dataSyncRequest;

    const productId = this.purifyProductId(_productId);
    const product = this.icellProductsService.getProductById(productId);

    if (!product) {
      throw new Error(`Product not found for productId: ${productId}`);
    }

    const service = this.icellProductsService.getServiceByProductId(productId);

    if (!service) {
      throw new Error(`Service not found for product: ${productId}`);
    }

    const result = await this.userService.findOrCreateUserByPhone(msisdn, {
      operation: 'get-or-create',
      religion: service.religion,
      authMethod: PhoneAuthMethodEnum.MAGIC_LINK, // Use magic link by default
    });

    const { user, magicLinkToken } = result;

    const txnRef = this.generateTransactionId();

    const transaction = await this.createTransaction(
      txnRef,
      user,
      product,
      dataSyncRequest,
    );

    await this.handleSubscriptionActivation(
      txnRef,
      user,
      product,
      service,
      dataSyncRequest,
      transaction,
    );

    // Send magic link via SMS
    if (magicLinkToken) {
      await this.notificationService.sendMagicLink(
        product,
        msisdn,
        magicLinkToken,
        service.religion as ReligionEnum,
        { type: 'subscription' },
      );
    } else {
      // Fallback: log error if magic link token is not generated
      this.logger.error(
        `Magic link token not generated for user: ${user.id}, phone: ${msisdn}`,
      );
    }
  }

  async processUserRenewal(dataSyncRequest: IcellDatasyncRequestDto) {
    const { callingParty: msisdn, requestedPlan: _productId } = dataSyncRequest;

    const productId = this.purifyProductId(_productId);
    const product = this.icellProductsService.getProductById(productId);

    if (!product) {
      throw new Error(`Product not found for productId: ${productId}`);
    }

    const service = this.icellProductsService.getServiceByProductId(productId);

    if (!service) {
      throw new Error(`Service not found for product: ${productId}`);
    }

    // For renewals, user should already exist, but we use findOrCreateUserByPhone for consistency
    const result = await this.userService.findOrCreateUserByPhone(msisdn, {
      operation: 'get-or-create',
      religion: service.religion,
      authMethod: PhoneAuthMethodEnum.MAGIC_LINK, // Use magic link by default
    });

    const { user, magicLinkToken } = result;

    const txnRef = this.generateTransactionId();

    const transaction = await this.createTransaction(
      txnRef,
      user,
      product,
      dataSyncRequest,
    );

    // handleSubscriptionActivation already handles benefit rollover and subscription replacement
    await this.handleSubscriptionActivation(
      txnRef,
      user,
      product,
      service,
      dataSyncRequest,
      transaction,
    );

    // Send magic link via SMS
    if (magicLinkToken) {
      await this.notificationService.sendMagicLink(
        product,
        msisdn,
        magicLinkToken,
        service.religion as ReligionEnum,
        { type: 'renewal' },
      );
    } else {
      // Fallback: log error if magic link token is not generated
      this.logger.error(
        `Magic link token not generated for user: ${user.id}, phone: ${msisdn}`,
      );
    }
  }

  async processUserUnsubscription(dataSyncRequest: IcellDatasyncRequestDto) {
    const { callingParty: msisdn, requestedPlan: _productId } = dataSyncRequest;

    const productId = this.purifyProductId(_productId);
    const product = this.icellProductsService.getProductById(productId);

    if (!product) {
      throw new Error(`Product not found for productId: ${productId}`);
    }

    const service = this.icellProductsService.getServiceByProductId(productId);

    if (!service) {
      throw new Error(`Service not found for product: ${productId}`);
    }

    const { user } = await this.userService.findOrCreateUserByPhone(msisdn, {
      operation: 'get-or-create',
      religion: service.religion,
    });

    await this.deactivateSubscription(user, product, service);

    await this.notificationService.sendUnsubscriptionSms(product, msisdn);
  }

  /**
   * Process subscription expirations
   * This function is called by the cron job to process subscription expirations
   * It will deactivate the subscription and send an sms to the user
   */
  async processSubscriptionExpirations() {
    // Get the start of the current day
    const start = startOfDay(new Date());
    // Calculate the date 2 days ago from now
    const twoDaysAgo = subDays(start, 2);

    // Find all active subscriptions that ended 2 days ago
    const subscriptions = await this.prismaService.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: { lte: twoDaysAgo },
      },
    });

    // Expire each subscription
    for (const subscription of subscriptions) {
      await this.expireSubscription(subscription);
    }

    return subscriptions.length;
  }

  // API services
  async getStore(
    religion: Religion,
    user: UserEntity,
  ): Promise<IServiceResponse<StoreAndWalletResponseDto>> {
    const icellServices = this.icellProductsService.getServicesByReligion(
      religion.code,
    );

    const products = icellServices.flatMap((service) => service.products);

    const wallet = await this.prismaService.wallet.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        balance: true,
        lastUpdated: true,
      },
    });

    const subscription = await this.prismaService.subscription.findFirst({
      where: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
      },
      select: {
        id: true,
        productId: true,
        productName: true,
        serviceId: true,
        serviceName: true,
        startDate: true,
        endDate: true,
        maxAccess: true,
        accessCount: true,
        status: true,
      },
    });

    return {
      success: true,
      message: 'Store retrieved successfully',
      data: {
        products,
        wallet,
        subscription,
      },
    };
  }
}
