import { Injectable } from '@nestjs/common';
import { TimeUtilsService } from '../utils/time';
import { PrismaService } from 'src/common/services/database/prisma';
import { Religion } from '@prisma/client';
import { DailyDevotionalResponseDto } from 'src/common/dto/devotional';
import { IServiceResponse } from 'src/common';

@Injectable()
export class DevotionalService {
  constructor(
    private readonly timeUtils: TimeUtilsService,
    private readonly prismaService: PrismaService,
  ) {}

  async getTodaysDevotional(
    religion: Religion,
  ): Promise<IServiceResponse<DailyDevotionalResponseDto>> {
    const dayOfYear = this.timeUtils.getDayOfYear();
    const devotional = await this.prismaService.dailyDevotional.findFirst({
      where: { dayId: dayOfYear, religionId: religion.id },
      select: {
        id: true,
        dayId: true,
        content: true,
      },
    });
    return {
      success: true,
      data: devotional,
      message: 'Devotional fetched successfully',
    };
  }

  async getPreviousDaysDevotionals(
    daysCount: number,
    religion: Religion,
  ): Promise<IServiceResponse<DailyDevotionalResponseDto[]>> {
    const previousDaysOfYear =
      this.timeUtils.getPreviousDaysFromToday(daysCount);
    const devotionals = await this.prismaService.dailyDevotional.findMany({
      where: {
        dayId: { in: previousDaysOfYear },
        religionId: religion.id,
      },
      select: {
        id: true,
        dayId: true,
        content: true,
      },
    });
    return {
      success: true,
      data: devotionals,
      message: 'Devotionals fetched successfully',
    };
  }
}
