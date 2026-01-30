import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthenticatedUserSocket } from 'src/common/interfaces';
import { GatewaySessionManager } from './gateway-session.manager';
import {
  ClientEvents,
  GROUP_PREFIX,
  InternalEvents,
  ServerEvents,
} from 'src/common/constants';
import { PrismaService } from 'src/common/services/database/prisma';
import { OnEvent } from '@nestjs/event-emitter';
import { SimpleMessageEntity } from 'src/common/dto/group';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly sessionManager: GatewaySessionManager,
    private readonly prismaService: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;

  private async isGroupMember(groupId: string, userId: string) {
    return !!(await this.prismaService.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    }));
  }

  private generateRoomId(groupId: string) {
    return `${GROUP_PREFIX}${groupId}`;
  }

  async handleConnection(socket: AuthenticatedUserSocket) {
    this.logger.log(`${socket.data.user.fullName} - ${socket.id} Connected`);
    await this.sessionManager.setUserSocket(socket.data.user.id, socket);
    socket.emit('connected', {});
  }

  async handleDisconnect(socket: AuthenticatedUserSocket) {
    this.logger.log(`${socket.data.user.fullName} - ${socket.id} Disconnected`);
    if (socket.data.user) {
      await this.sessionManager.removeUserSocket(socket.data.user.id);
    }
  }

  // Client & Server Events Handlers
  @SubscribeMessage(ClientEvents.JOIN_GROUP)
  async handleJoinGroup(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: AuthenticatedUserSocket,
  ) {
    const { groupId } = data;
    const { user } = client.data;
    const roomId = this.generateRoomId(groupId);
    const isGroupMember = await this.isGroupMember(groupId, user.id);

    if (!isGroupMember) {
      // Emit an error event back to the client
      client.emit(ServerEvents.ERROR, {
        event: ClientEvents.JOIN_GROUP,
        message: 'You are not a member of this group',
      });
      return;
    }

    // Join the group
    client.join(roomId);

    // Emit the group member added event
    client.to(roomId).emit(ServerEvents.GROUP_MEMBER_ADDED, {
      message: `${user.fullName} joined the group`,
    });
  }

  @SubscribeMessage(ClientEvents.START_TYPING)
  handleStartTyping(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: AuthenticatedUserSocket,
  ) {
    const { groupId } = data;
    const { user } = client.data;
    const roomId = this.generateRoomId(groupId);
    client.to(roomId).emit(ServerEvents.PEER_STARTED_TYPING, {
      message: `${user.fullName} is typing...`,
    });
  }

  // OnEvents Handlers
  @OnEvent(InternalEvents.MESSAGE.CREATED)
  handleMessageCreated(message: SimpleMessageEntity) {
    const roomId = this.generateRoomId(message.groupId);
    this.server.to(roomId).emit(ServerEvents.GROUP_MESSAGE_RECEIVED, {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.createdBy.id,
      senderFirstName: message.createdBy.firstName,
      senderLastName: message.createdBy.lastName,
      senderProfilePhoto: message.createdBy.profilePhoto,
      attachments: message.attachments,
    });
  }
}
