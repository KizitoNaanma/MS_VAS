import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Group, Prisma, Religion } from '@prisma/client';
import {
  IServiceResponse,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/common';
import { InternalEvents } from 'src/common/constants';
import {
  GroupResponseDto,
  SimpleAttachmentResponseDto,
  SimpleGroupResponseDto,
  SimpleMessageWithAttachmentsPaginatedResponseDto,
  SimpleMessageWithAttachmentsResponseDto,
} from 'src/common/dto/group';
import { PrismaService } from 'src/common/services/database/prisma';
import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';
import { AttachmentEntity } from 'src/shared/database/prisma/generated/attachment.entity';
import { CreateGroupDto } from 'src/shared/database/prisma/generated/create-group.dto';
import { CreateMessageDto } from 'src/shared/database/prisma/generated/create-message.dto';
import { MessageEntity } from 'src/shared/database/prisma/generated/message.entity';
import { UpdateGroupDto } from 'src/shared/database/prisma/generated/update-group.dto';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';

@Injectable()
export class GroupService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly s3StorageService: S3StorageService,
  ) {}

  private generateAttachmentS3Key(filename: string): string {
    return `chats/attachments/${Date.now()}-${filename}`;
  }

  async createGroup(
    user: UserEntity,
    religion: Religion,
    data: CreateGroupDto,
  ): Promise<IServiceResponse<SimpleGroupResponseDto>> {

    if (!religion) {
      throw new BadRequestException('Religion not found');
    }

    const group = await this.prismaService.group.create({
      data: {
        ...data,
        religion: {
          connect: {
            id: religion.id,
          },
        },
        createdBy: {
          connect: {
            id: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
        createdAt: true,
      },
    });

    // Create group membership for the creator
    await this.prismaService.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        role: 'ADMIN',
      },
    });

    return {
      data: group,
      message: 'Group created and joined successfully',
      success: true,
    };
  }

  async updateGroup(
    groupId: string,
    user: UserEntity,
    data: UpdateGroupDto,
  ): Promise<IServiceResponse<SimpleGroupResponseDto>> {
    const member = await this.prismaService.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        role: 'ADMIN',
      },
    });

    if (!member) {
      throw new BadRequestException('User is not a group admin');
    }

    const group = await this.prismaService.group.update({
      where: { id: groupId },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      data: group,
      message: 'Group updated successfully',
      success: true,
    };
  }

  async getGroups(
    user: UserEntity,
    religion: Religion,
    owner?: 'me' | 'others',
    joined?: 'true' | 'false',
  ): Promise<IServiceResponse<SimpleGroupResponseDto[]>> {
    const hasJoined = joined === 'true';

    let userGroups = [];
    const groups = await this.prismaService.group.findMany({
      where: {
        religionId: religion.id,
        ...(owner === 'me' && { createdById: user.id }),
        ...(owner === 'others' && { createdById: { not: user.id } }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
        createdAt: true,
      },
    });

    if (hasJoined) {
      const joinedGroups = await this.prismaService.groupMember.findMany({
        where: {
          userId: user.id,
        },
      });

      userGroups = groups.filter((group) =>
        joinedGroups.some((joinedGroup) => joinedGroup.groupId === group.id),
      );
    }

    return {
      data: hasJoined ? userGroups : groups,
      message: 'Groups fetched successfully',
      success: true,
    };
  }

  async searchGroups(
    religion: Religion,
    query: string,
  ): Promise<IServiceResponse<SimpleGroupResponseDto[]>> {
    const searchKeywords = query.trim().split(' ').join(' | ');

    const groups = await this.prismaService.$queryRaw<Group[]>(
      Prisma.sql`SELECT * FROM "Group" WHERE
      to_tsvector('english', "description") @@ to_tsquery(${searchKeywords})
      OR to_tsvector('english', "name") @@ to_tsquery(${searchKeywords})
      OR "Group"."name" ILIKE '%' || ${searchKeywords} || '%'
      OR "Group"."description" ILIKE '%' || ${searchKeywords} || '%'
      AND "Group"."religionId" = ${religion.id};`,
    );

    return {
      data: groups,
      message: 'Groups fetched successfully',
      success: true,
    };
  }

  async getGroup(groupId: string): Promise<IServiceResponse<GroupResponseDto>> {
    const group = await this.prismaService.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        members: {
          select: {
            id: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return {
        message: 'Group not found',
        success: false,
      };
    }

    return {
      data: group,
      message: 'Group fetched successfully',
      success: true,
    };
  }

  async joinGroup(groupId: string, userId: string): Promise<IServiceResponse> {
    try {
      // Check if user is already a member
      const existingMembership =
        await this.prismaService.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId,
            },
          },
        });

      // treating this as an idempotent operation
      if (existingMembership) {
        return {
          message: 'User is already a member of this group',
          success: true,
        };
      }

      // Find group with its visibility status
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
        include: {
          members: true,
        },
      });

      if (!group) {
        return {
          message: 'Group not found',
          success: false,
        };
      }

      // Check if user exists
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          message: 'User not found',
          success: false,
        };
      }

      // Create group membership with transaction to ensure data consistency
      await this.prismaService.$transaction(async (prisma) => {
        const membership = await prisma.groupMember.create({
          data: {
            groupId,
            userId,
            role: group.createdById === userId ? 'ADMIN' : 'MEMBER',
          },
          include: {
            group: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        return membership;
      });

      return {
        message: 'Successfully joined the group',
        success: true,
      };
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : 'Failed to join group',
        success: false,
      };
    }
  }

  async leaveGroup(groupId: string, userId: string): Promise<IServiceResponse> {
    try {
      // Check if user is a member of the group
      const existingMembership =
        await this.prismaService.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId,
            },
          },
        });

      if (!existingMembership) {
        return {
          message: 'User is not a member of this group',
          success: false,
        };
      }

      // Delete the membership
      await this.prismaService.groupMember.delete({
        where: { id: existingMembership.id },
      });

      return {
        message: 'Successfully left the group',
        success: true,
      };
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : 'Failed to leave group',
        success: false,
      };
    }
  }

  async removeMemberFromGroup(
    groupId: string,
    userId: string,
    user: UserEntity,
  ): Promise<IServiceResponse> {
    const isCurrentUserAdmin = await this.prismaService.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        role: 'ADMIN',
      },
    });

    if (!isCurrentUserAdmin) {
      throw new BadRequestException(
        'Only group admins can perform this action',
      );
    }

    const member = await this.prismaService.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!member) {
      return {
        message: 'User is not a member of this group',
        success: false,
      };
    }

    if (member.role === 'ADMIN') {
      return {
        message: 'Cannot remove admin from group',
        success: false,
      };
    }

    await this.prismaService.groupMember.delete({
      where: { id: member.id },
    });

    return {
      message: 'Member removed successfully',
      success: true,
    };
  }

  // Messages
  async sendMessageToGroup(
    groupId: string,
    user: UserEntity,
    data: CreateMessageDto,
    attachments: Express.Multer.File[],
  ): Promise<IServiceResponse<SimpleMessageWithAttachmentsResponseDto>> {
    const { content } = data;
    const message = await this.prismaService.message.create({
      data: {
        content,
        groupId,
        createdById: user.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    // Upload attachments to S3
    let messageAttachments: SimpleAttachmentResponseDto[] = [];
    if (attachments.length > 0) {
      messageAttachments = await Promise.all(
        attachments.map(async (attachmentObj) => {
          const filename = this.generateAttachmentS3Key(
            attachmentObj.originalname,
          );
          await this.s3StorageService.uploadFile(attachmentObj, filename);
          const attachment = await this.prismaService.attachment.create({
            data: {
              filename: attachmentObj.originalname,
              objectKey: filename,
              mimeType: attachmentObj.mimetype,
              size: attachmentObj.size,
              messageId: message.id,
            },
            select: {
              id: true,
              filename: true,
              objectKey: true,
              mimeType: true,
              size: true,
            },
          });

          const url = this.s3StorageService.getFileUrl(attachment.objectKey);
          return {
            ...attachment,
            url,
          };
        }),
      );
    }

    this.eventEmitter.emit(InternalEvents.MESSAGE.CREATED, {
      ...message,
      groupId,
      createdBy: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
      },
      attachments: messageAttachments ?? [],
    });

    return {
      data: {
        ...message,
        createdBy: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePhoto: user.profilePhoto,
        },
        attachments: messageAttachments,
      },
      message: 'Message sent successfully',
      success: true,
    };
  }

  async getMessagesOfGroup(
    groupId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<
    IServiceResponse<SimpleMessageWithAttachmentsPaginatedResponseDto>
  > {
    const messages = await this.prismaService.message.findMany({
      where: { groupId },
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.pageSize,
      orderBy: { createdAt: pageOptionsDto.order },
      include: {
        attachments: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            size: true,
            objectKey: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    const messagesResponseDto = messages.map((message) => {
      const messageResponseDto = new SimpleMessageWithAttachmentsResponseDto(
        message as MessageEntity,
      );
      messageResponseDto.attachments = message.attachments.map(
        (attachment) =>
          new SimpleAttachmentResponseDto(attachment as AttachmentEntity),
      );
      return messageResponseDto;
    });

    const itemCount = await this.prismaService.message.count({
      where: { groupId },
    });

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto,
    });

    return {
      data: new PageDto(messagesResponseDto, pageMetaDto),
      message: 'Messages fetched successfully',
      success: true,
    };
  }
}
