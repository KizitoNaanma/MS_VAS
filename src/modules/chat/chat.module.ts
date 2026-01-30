import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { WebsocketGuard } from 'src/common/services/guards';
import { JwtUtilsService, TimeUtilsService } from '../utils';
import { GatewaySessionManager } from './gateway-session.manager';
import { DatabaseServicesModule } from 'src/common/services/database/database.module';

@Module({
  imports: [DatabaseServicesModule],
  providers: [
    ChatGateway,
    WebsocketGuard,
    JwtUtilsService,
    GatewaySessionManager,
    TimeUtilsService,
  ],
})
export class ChatModule {}
