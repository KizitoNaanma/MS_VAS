import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ErrorDtoResponse,
  IBankTransferPayload,
  ICacheService,
  IHttpService,
  IServiceResponse,
  ISuccessResponse,
  ONIONPAY_BASE_URL,
  ONIONPAY_SECRET_KEY,
  ResponseState,
} from 'src/common';
import { BankTransferResponseDto } from 'src/common/dto/onionpay';
import { IBankInformation } from 'src/common/types/payment';
import { TimeUtilsService } from 'src/modules/utils';

@Injectable()
export class OnionPayService implements OnModuleInit {
  private readonly logger = new Logger(OnionPayService.name);
  private readonly REFRESH_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly CACHE_KEY = 'onionpay-bank-list';

  constructor(
    private readonly http: IHttpService,
    private readonly timeUtils: TimeUtilsService,
    @Inject('Redis') private readonly cache: ICacheService,
  ) {}

  private config() {
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ONIONPAY_SECRET_KEY,
      },
    };
  }

  private getUrl(path: string) {
    return `${ONIONPAY_BASE_URL}/api/v2/${path}`;
  }

  private async getBankListFromOnionPay() {
    const config = this.config();
    const response = await this.http.get(
      this.getUrl('wallet/get-banks'),
      config,
    );

    const data = response.data as IBankInformation[];

    return data;
  }

  private async storeBankList() {
    const bankList = await this.getBankListFromOnionPay();
    const sevenDays = this.timeUtils.convertToMilliseconds('days', 7);

    await Promise.all([
      this.cache.set(this.CACHE_KEY, bankList, sevenDays),
      this.cache.set(
        `${this.CACHE_KEY}:meta`,
        { timestamp: Date.now() },
        sevenDays,
      ),
    ]);

    return bankList;
  }

  private async refreshCacheIfNeeded() {
    const metadata = await this.cache.get(`${this.CACHE_KEY}:meta`);
    const isStale =
      !metadata || Date.now() - metadata.timestamp > this.REFRESH_THRESHOLD;

    if (isStale) {
      await this.storeBankList();
    }
  }

  async onModuleInit() {
    this.logger.log('Initializing OnionPayService and caching bank list...');
    // await this.storeBankList();
  }

  async getBankList(): Promise<IBankInformation[]> {
    const cachedValue = await this.cache.get(this.CACHE_KEY);

    if (cachedValue) {
      this.refreshCacheIfNeeded().catch((error) =>
        this.logger.error('Background cache refresh failed:', error),
      );
      return cachedValue;
    }

    return await this.storeBankList();
  }
  async getBankAccountDetails(
    accountNumber: string,
    bankCode: string,
  ): Promise<IServiceResponse<{ name: string } | null>> {
    try {
      const config = this.config();
      const response: ISuccessResponse | ErrorDtoResponse = await this.http.get(
        this.getUrl(
          `wallet/bank-account-details?accountNumber=${accountNumber}&accountBankCode=${bankCode}`,
        ),
        config,
      );
      let data: { name: string } | null = null;

      if (response.state === ResponseState.SUCCESS) {
        data = (response as ISuccessResponse).data as { name: string };
        return {
          success: true,
          message: 'Bank account details found',
          data: data,
        };
      } else {
        return {
          success: false,
          message: 'Bank account details not found',
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
  async makeBankTransfer(
    payload: IBankTransferPayload,
  ): Promise<IServiceResponse<BankTransferResponseDto | null>> {
    const config = this.config();
    try {
      const response: ISuccessResponse | ErrorDtoResponse =
        await this.http.post(
          this.getUrl('wallet/transfer-to-bank'),
          payload,
          config,
        );
      let data: BankTransferResponseDto | null = null;

      if (response.state === ResponseState.SUCCESS) {
        data = (response as ISuccessResponse).data as BankTransferResponseDto;
        return {
          success: true,
          message: 'Withdrawal request initiated',
          data: data,
        };
      } else {
        return {
          success: false,
          message: (response as ErrorDtoResponse).message,
          data: null,
        };
      }
    } catch (error) {
      this.logger.error('Error making bank transfer:', error.message);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
}
