import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  OutgoingSmsPayloadDto,
  SendSmsResponseDto,
} from 'src/common/dto/icell';
import {
  ICELL_BASE_URL,
  ICELL_API_TOKEN,
  ICELL_TEST_SERVICES,
  ICELL_TEST_API_TOKEN,
  ICELL_SERVICE_CODE,
  env,
} from 'src/common/env';
import { IcellProductAndServiceType } from 'src/common/types/product';
import { IcellLoggerService } from './icell-logger.service';
@Injectable()
export class IcellClient {
  constructor(private readonly siberianLogger: IcellLoggerService) {}

  private generateIcellTransactionId(): string {
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    return `${timestamp}${randomNumber}`;
  }

  async sendSmsHttpRequest(
    smsPayload: OutgoingSmsPayloadDto,
  ): Promise<SendSmsResponseDto> {
    const url = `${ICELL_BASE_URL}/v3/sms/messages/sms/outbound`;

    const clientCorrelatorId = this.generateClientCorrelatorId();

    const payload = {
      clientCorrelatorId,
      message: smsPayload.message,
      receiverAddress: smsPayload.receiverAddress,
      serviceCode: ICELL_SERVICE_CODE,
      // requestDeliveryReceipt: request.requestDeliveryReceipt,
    };

    const headers = {
      'Content-Type': 'application/json',
      'api-token': ICELL_API_TOKEN,
    };

    try {
      await this.siberianLogger.logJson(
        `Sending SMS Request: [${env.env.toUpperCase()}] to ${smsPayload.receiverAddress.join(', ')}`,
        {
          url,
          payload,
          headers,
        },
      );
      const response = await axios.post(url, payload, {
        headers,
        timeout: 10000,
      });

      await this.siberianLogger.logJson(
        `SMS Response Data: [${env.env.toUpperCase()}] for ${smsPayload.receiverAddress[0]}`,
        response.data,
      );

      return { success: true, message: 'SMS sent successfully' };
    } catch (error) {
      return { success: false, message: error.response?.data || error.message };
    }
  }

  async handleSubscriptionRequest(
    msisdn: string,
    productAndService: IcellProductAndServiceType,
    regChannel: 'SMS',
  ) {
    const { service, product } = productAndService;

    let REQUEST_API_TOKEN = ICELL_API_TOKEN;
    const REQUEST_NODE_ID = 'ICELL';

    if (
      ICELL_TEST_SERVICES &&
      Array.isArray(ICELL_TEST_SERVICES) &&
      ICELL_TEST_SERVICES.includes(service.id)
    ) {
      REQUEST_API_TOKEN = ICELL_TEST_API_TOKEN;
    }

    const url = `${ICELL_BASE_URL}/v2/customers/${msisdn}/subscriptions`;

    const transactionId = this.generateIcellTransactionId();
    // const correlationId = this.generateClientCorrelatorId();

    const headers = {
      'Content-Type': 'application/json',
      'api-token': REQUEST_API_TOKEN,
      transactionId: transactionId,
    };

    if (service.type === undefined) {
      return {
        success: false,
        message: `Service type is undefined for ${service.id} & product ${product.id}`,
      };
    }

    const payload =
      service.type === 'ondemand'
        ? {
            nodeId: REQUEST_NODE_ID,
            subscriptionProviderId: 'MSAP',
            subscriptionId: service.id,
            subscriptionDescription: product.id,
            registrationChannel: regChannel,
            // customerId: msisdn,
            // bundleType: 'N',
            // amountCharged: product.price,
            // correlationId,
            // validity: 'Y',
          }
        : {
            nodeId: REQUEST_NODE_ID,
            subscriptionProviderId: 'MSAP',
            subscriptionId: service.id,
            subscriptionDescription: product.id,
            registrationChannel: regChannel,
            // customerId: msisdn,
            // 'auto-renew': true,
            // correlationId,
            // validity: 'Y',
            // bundleType: 'N',
          };

    try {
      await this.siberianLogger.logJson(
        `Making Subscription Request: [${env.env.toUpperCase()}] for ${msisdn}`,
        {
          url,
          payload,
          headers,
        },
      );
      const response = await axios.post(url, payload, {
        headers,
        timeout: 10000,
      });

      await this.siberianLogger.logJson(
        `Subscription Response Data: [${env.env.toUpperCase()}] for ${msisdn}`,
        response.data,
      );

      return { success: true, message: 'Subscription successful' };
    } catch (error) {
      return { success: false, message: error.response?.data || error.message };
    }
  }

  async handleUnsubscribeRequest(
    msisdn: string,
    productAndService: IcellProductAndServiceType,
  ) {
    const { service, product } = productAndService;
    const url = `${ICELL_BASE_URL}/v2/customers/${msisdn}/subscriptions/${product.id}`;

    let REQUEST_API_TOKEN = ICELL_API_TOKEN;
    const REQUEST_NODE_ID = 'ICELL';

    if (
      ICELL_TEST_SERVICES &&
      Array.isArray(ICELL_TEST_SERVICES) &&
      ICELL_TEST_SERVICES.includes(service.id)
    ) {
      REQUEST_API_TOKEN = ICELL_TEST_API_TOKEN;
    }

    const transactionId = this.generateIcellTransactionId();

    const queryParams = new URLSearchParams({
      subscriptionProviderId: 'MSAP',
      nodeId: REQUEST_NODE_ID,
      description: product.id,
    });

    const headers = {
      'Content-Type': 'application/json',
      'api-token': REQUEST_API_TOKEN,
      transactionId: transactionId,
    };

    try {
      const endpointUrl = `${url}?${queryParams.toString()}`;
      await this.siberianLogger.logJson(
        `Making Unsubscription Request: [${env.env.toUpperCase()}] for ${msisdn}`,
        {
          url,
          headers,
        },
      );
      await axios.delete(endpointUrl, { headers, timeout: 10000 });

      return { success: true, message: 'Unsubscription successful' };
    } catch (error) {
      return { success: false, message: 'Unsubscription failed' };
    }
  }

  private generateClientCorrelatorId(): string {
    const timestamp = Date.now().toString();
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    const reversedTimestamp = timestamp.split('').reverse().join('');
    return `${randomNumber}${reversedTimestamp}`;
  }
}
