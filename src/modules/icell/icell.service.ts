import { Injectable } from '@nestjs/common';

import {
  IcellDatasyncRequestDto,
  IncomingSmsNotificationDto,
} from 'src/common/dto/icell';

import { IcellSmsHandler } from 'src/shared/icell-core/handlers/icell-sms.handler';
import { IcellDatasyncHandler } from 'src/shared/icell-core/handlers/icell-datasync.handler';

@Injectable()
export class IcellService {
  constructor(
    private readonly smsHandler: IcellSmsHandler,
    private readonly icellDatasyncHandler: IcellDatasyncHandler,
  ) {}

  async processSmsRequest(data: IncomingSmsNotificationDto) {
    return this.smsHandler.processSmsRequest(data);
  }

  async processDatasyncNotification(
    request: IcellDatasyncRequestDto,
  ): Promise<void> {
    await this.icellDatasyncHandler.processDatasyncNotification(request);
  }
}
