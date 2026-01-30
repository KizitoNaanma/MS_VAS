import { Injectable, Logger } from '@nestjs/common';
import {
  IncomingSmsNotificationDto,
  OutgoingSmsPayloadDto,
} from 'src/common/dto/icell';
import { IcellProductsService } from '../services/icell-products.service';
import { IcellClient } from '../services/icell.client';
import { IcellProductType } from 'src/common/types/product';
import { env, ICELL_SERVICE_CODE } from 'src/common/env';
import { IcellLoggerService } from 'src/shared/icell-core/services/icell-logger.service';

@Injectable()
export class IcellSmsHandler {
  private readonly logger = new Logger(IcellSmsHandler.name);

  constructor(
    private readonly icellProductsService: IcellProductsService,
    private readonly icellClient: IcellClient,
    private readonly siberianLogger: IcellLoggerService,
  ) {}

  private generateSubscriptionProcessingSms(
    type: 'subscription' | 'unsubscription',
    product: IcellProductType,
  ): string {
    let smsMessage = '';
    if (type === 'unsubscription') {
      smsMessage = `Dear Customer, your request to unsubscribe from ${product.name} is now processing. You can resubscribe anytime by sending ${product.optInKeywords[0]} to ${ICELL_SERVICE_CODE}. Thank you for your patronage!`;
    }
    if (type === 'subscription') {
      smsMessage = `Dear Customer, your request to subscribe to ${product.name} is now processing. You will be notified once subscription is activated.`;
    }
    return smsMessage;
  }

  async processSmsRequest(data: IncomingSmsNotificationDto): Promise<void> {
    try {
      if (!data || !data.message) {
        throw new Error('Invalid SMS request data');
      }

      // Work with local variables instead of mutating input
      const reformattedMessage = data.message.trim();
      const senderAddress = data.senderAddress;
      let responseMessage: string;

      const { type, keyword } =
        this.icellProductsService.extractKeywords(reformattedMessage);
      const productAndService =
        this.icellProductsService.getProductAndServiceByKeyword(keyword);
      const { product } = productAndService;

      if (type === 'unsubscribe') {
        if (!productAndService) {
          responseMessage =
            "Invalid keyword for unsubscription. Try 'STOP/Unsubscribe NameOfProduct'";
        } else {
          const response = await this.icellClient.handleUnsubscribeRequest(
            senderAddress,
            productAndService,
          );

          responseMessage = response.success
            ? this.generateSubscriptionProcessingSms('unsubscription', product)
            : 'Your request to unsubscribe failed. Please try again.';
        }

        const responseSms = new OutgoingSmsPayloadDto(responseMessage, [
          senderAddress,
        ]);
        // send sms to the user from the service code
        await this.icellClient.sendSmsHttpRequest(responseSms);
      } else {
        // Handle subscription SMS protocol
        const { service, product } = productAndService;

        if (!service || !product) {
          responseMessage =
            "Invalid keyword for subscription. Try 'Subscribe NameOfProduct'";
        } else {
          const response = await this.icellClient.handleSubscriptionRequest(
            senderAddress,
            productAndService,
            'SMS',
          );

          await this.siberianLogger.logJson(
            `Subscription Request Response: [${env.env.toUpperCase()}] from icell`,
            response,
          );

          responseMessage = response.success
            ? this.generateSubscriptionProcessingSms('subscription', product)
            : 'Your request to subscribe failed. Please try again.';

          const responseSms = new OutgoingSmsPayloadDto(responseMessage, [
            senderAddress,
          ]);

          // send sms to the user from the service code
          const smsResponse =
            await this.icellClient.sendSmsHttpRequest(responseSms);

          await this.siberianLogger.logJson(
            `SMS Response: [${env.env.toUpperCase()}] from icell`,
            smsResponse,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error processing SMS request', error);
      throw error;
    }
  }
}
