import { Injectable, Logger } from '@nestjs/common';
import { SecureDNotificationRequestDto } from 'src/common/dto/secure-d';
import { PrismaService } from 'src/common/services/database/prisma';

@Injectable()
export class SecureDService {
  private readonly logger = new Logger(SecureDService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async processNotification(
    request: SecureDNotificationRequestDto,
  ): Promise<void> {
    try {
      // Calculate converted flag
      const converted =
        request.activation === '1' &&
        request.description.toLowerCase() === 'success';

      // Store SecureD notification data (no audit record creation)
      await this.prismaService.secureDDataSync.create({
        data: {
          msisdn: request.msisdn,
          activation: request.activation,
          productId: request.productID,
          description: request.description,
          timestamp: request.timestamp,
          trxId: request.trxId,
        },
      });

      this.logger.log(
        `SecureD notification stored for ${request.msisdn}, converted: ${converted}`,
      );
    } catch (error) {
      this.logger.error('Error processing SecureD notification', error);
      throw error;
    }
  }
}
