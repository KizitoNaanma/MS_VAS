import { Injectable } from '@nestjs/common';
import {
  IServiceResponse,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/common';
import {
  AdminDailyDevotionalPaginatedResponseDto,
  AdminDailyDevotionalResponseDto,
} from 'src/common/dto/devotional';
import { PrismaService } from 'src/common/services/database/prisma';
import { UpdateDailyDevotionalDto } from 'src/shared/database/prisma/generated/update-dailyDevotional.dto';

@Injectable()
export class AdminDevotionalsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDailyDevotionals(
    pageOptionsDto: PageOptionsDto,
  ): Promise<IServiceResponse<AdminDailyDevotionalPaginatedResponseDto>> {
    const devotionals = await this.prismaService.dailyDevotional.findMany({
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.pageSize,
      orderBy: {
        dayId: pageOptionsDto.order,
      },
      select: {
        id: true,
        dayId: true,
        content: true,
        religion: true,
      },
    });

    const devotionalsWithSimplifiedReligion = devotionals.map((devotional) => ({
      ...devotional,
      religion: devotional.religion.name,
    }));

    const itemCount = await this.prismaService.dailyDevotional.count();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return {
      success: true,
      data: new PageDto(devotionalsWithSimplifiedReligion, pageMetaDto),
      message: 'Devotionals fetched successfully',
    };
  }

  async getDailyDevotional(
    id: string,
  ): Promise<IServiceResponse<AdminDailyDevotionalResponseDto>> {
    const devotional = await this.prismaService.dailyDevotional.findUnique({
      where: { id },
      select: {
        id: true,
        dayId: true,
        content: true,
        religion: true,
      },
    });

    const devotionalWithSimplifiedReligion = {
      ...devotional,
      religion: devotional.religion.name,
    };

    return {
      success: true,
      data: devotionalWithSimplifiedReligion,
      message: 'Devotional retrieved successfully',
    };
  }

  async updateDailyDevotional(
    id: string,
    payload: UpdateDailyDevotionalDto,
  ): Promise<IServiceResponse<AdminDailyDevotionalResponseDto>> {
    const devotional = await this.prismaService.dailyDevotional.update({
      where: { id },
      data: {
        content: payload.content,
      },
      select: {
        id: true,
        dayId: true,
        content: true,
        religion: true,
      },
    });

    const devotionalWithSimplifiedReligion = {
      ...devotional,
      religion: devotional.religion.name,
    };

    return {
      success: true,
      data: devotionalWithSimplifiedReligion,
      message: 'Devotional updated successfully',
    };
  }
}
