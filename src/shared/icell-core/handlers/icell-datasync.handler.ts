import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OperationType } from '@prisma/client';
import { PrismaService } from 'src/common/services/database/prisma';
import { IcellDatasyncRequestDto } from 'src/common/dto/icell';
import { ICELL_OPERATIONS } from 'src/common/constants/icell';

@Injectable()
export class IcellDatasyncHandler {
  private readonly logger = new Logger(IcellDatasyncHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public determineDatasyncOperationType(operationId: string): OperationType {
    return ICELL_OPERATIONS[operationId] ?? OperationType.UNKNOWN;
  }

  async processDatasyncNotification(
    request: IcellDatasyncRequestDto,
  ): Promise<void> {
    try {
      // Data persistence only
      await this.prisma.icellDatasync.create({ data: request });

      // Determine operation and emit events (no business logic)
      const operationType = this.determineDatasyncOperationType(
        request.operationId,
      );

      if (operationType === OperationType.SUBSCRIPTION) {
        this.eventEmitter.emit('subscription.process', request);
      } else if (operationType === OperationType.RENEWAL) {
        this.eventEmitter.emit('subscription.renewal', request);
      } else if (operationType === OperationType.UNSUBSCRIPTION) {
        this.eventEmitter.emit('subscription.unsubscription', request);
      } else {
        // Fallback: Handle unmatched operations with generic audit recording
        this.logger.warn(
          `Unmatched operation type: ${operationType} for operation ID: ${request.operationId}. Processing with generic audit.`,
        );
        this.eventEmitter.emit('subscription.audit', request);
      }
    } catch (error) {
      this.logger.error('Error processing datasync notification', error);
      throw error;
    }
  }
}
