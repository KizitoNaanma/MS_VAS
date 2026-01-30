import { Injectable } from '@nestjs/common';
import {
  IServiceResponse,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/common';
import {
  AdminDailyScripturePaginatedResponseDto,
  AdminDailyScriptureResponseDto,
} from 'src/common/dto/scripture';
import { PrismaService } from 'src/common/services/database/prisma';
import { UpdateDailyScriptureDto } from 'src/shared/database/prisma/generated/update-dailyScripture.dto';

@Injectable()
export class AdminScripturesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDailyScriptures(
    pageOptionsDto: PageOptionsDto,
  ): Promise<IServiceResponse<AdminDailyScripturePaginatedResponseDto>> {
    const dailyScriptures = await this.prismaService.dailyScripture.findMany({
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

    const dailyScripturesWithSimplifiedReligion = dailyScriptures.map(
      (dailyScripture) => ({
        ...dailyScripture,
        religion: dailyScripture.religion.name,
      }),
    );

    const itemCount = await this.prismaService.dailyScripture.count();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return {
      success: true,
      data: new PageDto(dailyScripturesWithSimplifiedReligion, pageMetaDto),
      message: 'Daily scriptures fetched successfully',
    };
  }

  async getDailyScripture(
    id: string,
  ): Promise<IServiceResponse<AdminDailyScriptureResponseDto>> {
    const dailyScripture = await this.prismaService.dailyScripture.findUnique({
      where: { id },
      select: {
        id: true,
        dayId: true,
        content: true,
        religion: true,
      },
    });

    const dailyScriptureWithSimplifiedReligion = {
      ...dailyScripture,
      religion: dailyScripture.religion.name,
    };

    return {
      success: true,
      data: dailyScriptureWithSimplifiedReligion,
      message: 'Daily scripture fetched successfully',
    };
  }

  async updateDailyScripture(
    id: string,
    payload: UpdateDailyScriptureDto,
  ): Promise<IServiceResponse<AdminDailyScriptureResponseDto>> {
    const dailyScripture = await this.prismaService.dailyScripture.update({
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

    const dailyScriptureWithSimplifiedReligion = {
      ...dailyScripture,
      religion: dailyScripture.religion.name,
    };

    return {
      success: true,
      data: dailyScriptureWithSimplifiedReligion,
      message: 'Daily scripture updated successfully',
    };
  }
}
