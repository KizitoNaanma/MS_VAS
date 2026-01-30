import { Injectable } from '@nestjs/common';
import { TimeUtilsService } from '../utils';
import { PrismaService } from 'src/common/services/database/prisma';
import { Religion } from '@prisma/client';
import { IServiceResponse } from 'src/common';
import { DailyPrayerResponseDto } from 'src/common/dto/prayer';

@Injectable()
export class PrayerService {
  constructor(
    private readonly timeUtils: TimeUtilsService,
    private readonly prismaService: PrismaService,
  ) {}

  async getTodaysPrayer(
    religion: Religion,
  ): Promise<IServiceResponse<DailyPrayerResponseDto>> {
    const dayOfYear = this.timeUtils.getDayOfYear();
    const prayer = await this.prismaService.dailyPrayer.findFirst({
      where: { dayId: dayOfYear, religionId: religion.id },
      select: {
        id: true,
        dayId: true,
        content: true,
      },
    });
    return {
      success: true,
      data: prayer,
      message: 'Prayer fetched successfully',
    };
  }

  async getPreviousDaysPrayers(
    daysCount: number,
    religion: Religion,
  ): Promise<IServiceResponse<DailyPrayerResponseDto[]>> {
    const previousDaysOfYear =
      this.timeUtils.getPreviousDaysFromToday(daysCount);
    const prayers = await this.prismaService.dailyPrayer.findMany({
      where: { dayId: { in: previousDaysOfYear }, religionId: religion.id },
      select: {
        id: true,
        dayId: true,
        content: true,
      },
    });
    return {
      success: true,
      data: prayers,
      message: 'Prayers fetched successfully',
    };
  }
}
