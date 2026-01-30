import { Injectable } from '@nestjs/common';
import { Prisma, Religion } from '@prisma/client';
import { IServiceResponse } from 'src/common';
import {
  MindfulnessResourceCategoryResponseDto,
  MindfulnessResourceResponseDto,
} from 'src/common/dto/mindfulness-resource';
import { PrismaService } from 'src/common/services/database/prisma';
// import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';

@Injectable()
export class MindfulnessResourceService {
  constructor(
    private readonly prismaService: PrismaService,
    // private readonly s3StorageService: S3StorageService,
  ) {}

  async getCategories(
    religion: Religion,
  ): Promise<IServiceResponse<MindfulnessResourceCategoryResponseDto[]>> {
    const categories =
      await this.prismaService.mindfulnessResourceCategory.findMany({
        where: {
          religionId: religion.id,
        },
        select: {
          id: true,
          name: true,
        },
      });

    return {
      data: categories,
      message: 'Mindfulness resource categories fetched successfully',
      success: true,
    };
  }

  async getResourcesByCategory(
    categoryId: string,
    religion: Religion,
  ): Promise<IServiceResponse<MindfulnessResourceResponseDto[]>> {
    const resources = await this.prismaService.mindfulnessResource.findMany({
      where: {
        categoryId,
        category: {
          religionId: religion.id,
        },
      },
      select: {
        id: true,
        name: true,
        textContent: true,
        audioObjectKey: true,
        imageObjectKey: true,
      },
    });

    const resourcesResponseDtos = resources.map(
      (resource) => new MindfulnessResourceResponseDto(resource),
    );

    return {
      data: resourcesResponseDtos,
      message: 'Mindfulness resources fetched successfully',
      success: true,
    };
  }

  async getResourceById(
    categoryId: string,
    resourceId: string,
    religion: Religion,
  ): Promise<IServiceResponse<MindfulnessResourceResponseDto>> {
    const resource = await this.prismaService.mindfulnessResource.findUnique({
      where: {
        id: resourceId,
        categoryId,
        category: {
          religionId: religion.id,
        },
      },
      select: {
        id: true,
        name: true,
        textContent: true,
        audioObjectKey: true,
        imageObjectKey: true,
      },
    });

    if (!resource) {
      return {
        data: null,
        message: 'Mindfulness resource not found',
        success: false,
      };
    }

    const resourceResponseDto = new MindfulnessResourceResponseDto(resource);

    return {
      data: resourceResponseDto,
      message: 'Mindfulness resource fetched successfully',
      success: true,
    };
  }

  async searchMindfulnessResources(
    query: string,
    religion: Religion,
  ): Promise<IServiceResponse<MindfulnessResourceResponseDto[]>> {
    const searchKeywords = query.trim().split(' ').join(' | ');
    const resources = await this.prismaService.$queryRaw<
      MindfulnessResourceResponseDto[]
    >(
      Prisma.sql`SELECT "id", "name", "textContent", "audioObjectKey" FROM "MindfulnessResource" WHERE (
        to_tsvector('english', "textContent") @@ to_tsquery(${searchKeywords})
        OR to_tsvector('english', "name") @@ to_tsquery(${searchKeywords})
        OR "MindfulnessResource"."textContent" ILIKE '%' || ${searchKeywords} || '%'
        OR "MindfulnessResource"."name" ILIKE '%' || ${searchKeywords} || '%'
      ) AND "MindfulnessResource"."categoryId" IN (
        SELECT "id" FROM "MindfulnessResourceCategory" WHERE "religionId" = ${religion.id}
      );`,
    );

    const resourcesResponseDtos = resources.map(
      (resource) => new MindfulnessResourceResponseDto(resource),
    );

    return {
      data: resourcesResponseDtos,
      message: 'Mindfulness resources fetched successfully',
      success: true,
    };
  }
}
