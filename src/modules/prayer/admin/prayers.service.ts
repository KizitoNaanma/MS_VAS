import { Injectable } from '@nestjs/common';
import {
  IServiceResponse,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/common';
import {
  AdminDailyPrayerPaginatedResponseDto,
  AdminDailyPrayerResponseDto,
} from 'src/common/dto/prayer';
import { PrismaService } from 'src/common/services/database/prisma';
import { UpdateDailyPrayerDto } from 'src/shared/database/prisma/generated/update-dailyPrayer.dto';

@Injectable()
export class AdminPrayersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDailyPrayers(
    pageOptionsDto: PageOptionsDto,
  ): Promise<IServiceResponse<AdminDailyPrayerPaginatedResponseDto>> {
    const prayers = await this.prismaService.dailyPrayer.findMany({
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

    const prayersWithSimplifiedReligion = prayers.map((prayer) => ({
      ...prayer,
      religion: prayer.religion.name,
    }));

    const itemCount = await this.prismaService.dailyPrayer.count();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return {
      success: true,
      data: new PageDto(prayersWithSimplifiedReligion, pageMetaDto),
      message: 'Prayers fetched successfully',
    };
  }

  async getDailyPrayer(
    id: string,
  ): Promise<IServiceResponse<AdminDailyPrayerResponseDto>> {
    const prayer = await this.prismaService.dailyPrayer.findUnique({
      where: { id },
      select: {
        id: true,
        dayId: true,
        content: true,
        religion: true,
      },
    });

    const prayerWithSimplifiedReligion = {
      ...prayer,
      religion: prayer.religion.name,
    };

    return {
      success: true,
      data: prayerWithSimplifiedReligion,
      message: 'Prayer fetched successfully',
    };
  }

  async updateDailyPrayer(
    id: string,
    payload: UpdateDailyPrayerDto,
  ): Promise<IServiceResponse<AdminDailyPrayerResponseDto>> {
    const prayer = await this.prismaService.dailyPrayer.update({
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

    const prayerWithSimplifiedReligion = {
      ...prayer,
      religion: prayer.religion.name,
    };

    return {
      success: true,
      data: prayerWithSimplifiedReligion,
      message: 'Prayer updated successfully',
    };
  }
}
