import { Injectable } from '@nestjs/common';
import { Journal, Prisma } from '@prisma/client';
import { IServiceResponse } from 'src/common';
import { PrismaService } from 'src/common/services/database/prisma';
import { JournalDto } from 'src/shared/database/prisma/generated/journal.dto';
import { UpdateJournalDto } from 'src/shared/database/prisma/generated/update-journal.dto';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';

@Injectable()
export class JournalService {
  constructor(private readonly prismaService: PrismaService) {}

  async getJournals(userId: string): Promise<IServiceResponse<JournalDto[]>> {
    const journals = await this.prismaService.journal.findMany({
      where: {
        createdById: userId,
      },
      omit: {
        createdById: true,
      },
    });
    return {
      data: journals,
      message: 'Journals fetched successfully',
      success: true,
    };
  }

  async getJournal(userId: string, id: string): Promise<IServiceResponse> {
    const journal = await this.prismaService.journal.findUnique({
      where: { id, createdById: userId },
      omit: {
        createdById: true,
      },
    });

    if (!journal) {
      return {
        message: 'Journal not found',
        success: false,
      };
    }

    return {
      data: journal,
      message: 'Journal fetched successfully',
      success: true,
    };
  }

  async createJournal(
    data: Pick<Prisma.JournalCreateInput, 'title' | 'body'> & {
      createdById: string;
    },
  ): Promise<IServiceResponse> {
    const { createdById, ...payload } = data;
    const journal = await this.prismaService.journal.create({
      data: {
        ...payload,
        createdBy: { connect: { id: createdById } },
      },
    });
    return {
      data: journal,
      message: 'Journal created successfully',
      success: true,
    };
  }

  async searchUserJournals(
    user: UserEntity,
    searchQuery: string,
  ): Promise<IServiceResponse> {
    const searchKeywords = searchQuery.trim().split(' ').join(' | ');
    const journals = await this.prismaService.$queryRaw<Journal[]>(
      Prisma.sql`SELECT * FROM "Journal" WHERE
      ("Journal"."createdById" = ${user.id}) AND (
        to_tsvector('english', "body") @@ to_tsquery(${searchKeywords})
        OR to_tsvector('english', "title") @@ to_tsquery(${searchKeywords})
        OR "Journal"."title" ILIKE '%' || ${searchKeywords} || '%'
        OR "Journal"."body" ILIKE '%' || ${searchKeywords} || '%'
      );`,
    );
    return {
      data: journals,
      message: 'Journals fetched successfully',
      success: true,
    };
  }

  async updateJournal(
    id: string,
    user: UserEntity,
    data: UpdateJournalDto,
  ): Promise<IServiceResponse> {
    try {
      const journal = await this.prismaService.journal.update({
        where: { id, createdById: user.id },
        data,
      });
      return {
        data: journal,
        message: 'Journal updated successfully',
        success: true,
      };
    } catch (error) {
      return {
        message: 'Journal update failed',
        success: false,
      };
    }
  }

  async deleteJournal(id: string, user: UserEntity): Promise<IServiceResponse> {
    try {
      const journal = await this.prismaService.journal.delete({
        where: { id, createdById: user.id },
      });

      return {
        data: journal,
        message: 'Journal deleted successfully',
        success: true,
      };
    } catch (error) {
      return {
        message: 'Journal deletion failed',
        success: false,
      };
    }
  }
}
