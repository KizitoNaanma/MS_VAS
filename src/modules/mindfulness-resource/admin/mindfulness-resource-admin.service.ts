import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IServiceResponse,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
  ReligionEnum,
} from 'src/common';
import {
  AdminCreateMindfulnessResourceDto,
  AdminMindfulnessPaginatedResourceResponseDto,
  AdminMindfulnessResourceResponseDto,
  AdminUpdateMindfulnessResourceDto,
  MindfulnessResourceCategoryResponseDto,
  MindfulnessResourceResponseDto,
} from 'src/common/dto/mindfulness-resource';
import { PrismaService } from 'src/common/services/database/prisma';
import { MindfulnessResourceEntity } from 'src/shared/database/prisma/generated/mindfulnessResource.entity';
import { S3StorageService } from 'src/common/services/s3-storage/s3-storage.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MindfulnessResourcesAdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  private generateResourceMediaS3Key(
    filename: string,
    categoryName: string,
    religionCode: string,
    mediaType: 'audio' | 'image' = 'audio',
  ): string {
    const file_name = filename.split('.')[0];
    const file_ext = filename.split('.').pop();
    const _filename = `${mediaType === 'image' ? `IMG-${Date.now()}` : `${file_name}`}.${file_ext}`;
    return `mindfulness-resources/${religionCode}/${categoryName.toLowerCase()}/${_filename}`;
  }

  async getMindfulnessResources(
    pageOptionsDto: PageOptionsDto,
  ): Promise<IServiceResponse<AdminMindfulnessPaginatedResourceResponseDto>> {
    const mindfulnessResources =
      await this.prismaService.mindfulnessResource.findMany({
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.pageSize,
        orderBy: {
          createdAt: pageOptionsDto.order,
        },
        select: {
          id: true,
          name: true,
          imageObjectKey: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
        },
      });

    const mindfulnessResourcesResponseDtos = mindfulnessResources.map(
      (mindfulnessResource) => {
        return new AdminMindfulnessResourceResponseDto(
          mindfulnessResource as MindfulnessResourceEntity,
        );
      },
    );

    const itemCount = await this.prismaService.mindfulnessResource.count();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return {
      data: new PageDto(mindfulnessResourcesResponseDtos, pageMetaDto),
      success: true,
      message: 'Mindfulness resources fetched successfully',
    };
  }

  async getCategories(): Promise<
    IServiceResponse<MindfulnessResourceCategoryResponseDto[]>
  > {
    const categories =
      await this.prismaService.mindfulnessResourceCategory.findMany({
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

  async createMindfulnessResource(
    createMindfulnessResourceDto: AdminCreateMindfulnessResourceDto,
    audioFile: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<IServiceResponse<AdminMindfulnessResourceResponseDto>> {
    const resourceCategory =
      await this.prismaService.mindfulnessResourceCategory.findFirst({
        where: {
          id: createMindfulnessResourceDto.categoryId,
        },
        include: {
          religion: true,
        },
      });

    if (!resourceCategory) {
      throw new BadRequestException('Resource category not found');
    }
    const religion = resourceCategory.religion;

    const audioS3Key = this.generateResourceMediaS3Key(
      audioFile.originalname,
      resourceCategory.name,
      religion.code === ReligionEnum.CHRISTIANITY ? 'christian' : 'islam',
    );
    const audioUpload = await this.s3StorageService.uploadFile(
      audioFile,
      audioS3Key,
    );

    let imageUpload;
    if (imageFile) {
      const imageS3Key = this.generateResourceMediaS3Key(
        imageFile.originalname,
        resourceCategory.name,
        religion.code === ReligionEnum.CHRISTIANITY ? 'christian' : 'islam',
        'image',
      );
      imageUpload = await this.s3StorageService.uploadFile(
        imageFile,
        imageS3Key,
      );
    }

    const mindfulnessResource =
      await this.prismaService.mindfulnessResource.create({
        data: {
          ...createMindfulnessResourceDto,
          audioObjectKey: audioUpload.Key,
          imageObjectKey: imageUpload?.Key,
        },
        select: {
          id: true,
          name: true,
          imageObjectKey: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
        },
      });

    return {
      data: new AdminMindfulnessResourceResponseDto(
        mindfulnessResource as MindfulnessResourceEntity,
      ),
      success: true,
      message: 'Mindfulness resource created successfully',
    };
  }

  async updateMindfulnessResource(
    id: string,
    updateMindfulnessResourceDto: AdminUpdateMindfulnessResourceDto,
    audioFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<IServiceResponse<AdminMindfulnessResourceResponseDto>> {
    const mindfulnessResource =
      await this.prismaService.mindfulnessResource.findUnique({
        where: {
          id,
        },
      });

    if (!mindfulnessResource) {
      throw new BadRequestException('Mindfulness resource not found');
    }

    const resourceCategory =
      await this.prismaService.mindfulnessResourceCategory.findFirst({
        where: {
          id: updateMindfulnessResourceDto.categoryId,
        },
        include: {
          religion: true,
        },
      });

    if (!resourceCategory) {
      throw new BadRequestException('Resource category not found');
    }

    const religion = resourceCategory.religion;

    const audioS3Key = this.generateResourceMediaS3Key(
      audioFile.originalname,
      resourceCategory.name,
      religion.code === ReligionEnum.CHRISTIANITY ? 'christian' : 'islam',
    );

    const audioUpload = await this.s3StorageService.uploadFile(
      audioFile,
      audioS3Key,
    );

    let imageUpload;
    if (imageFile) {
      const imageS3Key = this.generateResourceMediaS3Key(
        imageFile.originalname,
        resourceCategory.name,
        religion.code === ReligionEnum.CHRISTIANITY ? 'christian' : 'islam',
        'image',
      );
      imageUpload = await this.s3StorageService.uploadFile(
        imageFile,
        imageS3Key,
      );
    }

    const updatedMindfulnessResource =
      await this.prismaService.mindfulnessResource.update({
        where: {
          id,
        },
        data: {
          ...updateMindfulnessResourceDto,
          audioObjectKey: audioUpload.Key,
          imageObjectKey: imageUpload?.Key,
        },
      });

    return {
      data: new AdminMindfulnessResourceResponseDto(
        updatedMindfulnessResource as MindfulnessResourceEntity,
      ),
      success: true,
      message: 'Mindfulness resource updated successfully',
    };
  }

  async searchAllMindfulnessResources(
    query: string,
  ): Promise<IServiceResponse<MindfulnessResourceResponseDto[]>> {
    const searchKeywords = query.trim().split(' ').join(' | ');
    const allResources = await this.prismaService.$queryRaw<
      MindfulnessResourceResponseDto[]
    >(
      Prisma.sql`SELECT "id", "name", "textContent", "audioObjectKey" FROM "MindfulnessResource" WHERE (
          to_tsvector('english', "textContent") @@ to_tsquery(${searchKeywords})
          OR to_tsvector('english', "name") @@ to_tsquery(${searchKeywords})
          OR "MindfulnessResource"."textContent" ILIKE '%' || ${searchKeywords} || '%'
          OR "MindfulnessResource"."name" ILIKE '%' || ${searchKeywords} || '%'
        );`,
    );

    const allResourcesResponseDtos = allResources.map(
      (resource) => new MindfulnessResourceResponseDto(resource),
    );

    return {
      data: allResourcesResponseDtos,
      message: 'Mindfulness resources fetched successfully',
      success: true,
    };
  }
}
