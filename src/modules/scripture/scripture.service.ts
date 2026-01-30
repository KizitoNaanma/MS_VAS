import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database/prisma';
import { TimeUtilsService } from '../utils';
import { Religion } from '@prisma/client';
import { DailyScriptureResponseDto } from 'src/common/dto/scripture';
import { IServiceResponse } from 'src/common';

@Injectable()
export class ScriptureService {
  constructor(
    private readonly timeUtils: TimeUtilsService,
    private readonly prismaService: PrismaService,
  ) {}

  async getTodaysScripture(
    religion: Religion,
  ): Promise<IServiceResponse<DailyScriptureResponseDto>> {
    const dayOfYear = this.timeUtils.getDayOfYear();
    const scripture = await this.prismaService.dailyScripture.findFirst({
      where: { dayId: dayOfYear, religionId: religion.id },
      select: { id: true, dayId: true, content: true },
    });
    return {
      success: true,
      message: 'Scripture fetched successfully',
      data: scripture,
    };
  }

  async getPreviousDaysScriptures(
    daysCount: number,
    religion: Religion,
  ): Promise<IServiceResponse<DailyScriptureResponseDto[]>> {
    const previousDaysOfYear =
      this.timeUtils.getPreviousDaysFromToday(daysCount);
    const scriptures = await this.prismaService.dailyScripture.findMany({
      where: { dayId: { in: previousDaysOfYear }, religionId: religion.id },
      select: { id: true, dayId: true, content: true },
    });
    return {
      success: true,
      message: 'Scriptures fetched successfully',
      data: scriptures,
    };
  }
}
