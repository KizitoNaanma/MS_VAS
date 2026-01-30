import { Injectable } from '@nestjs/common';
import { IServiceResponse } from 'src/common';
import { MarketersAnalyticsResponseDto } from 'src/common/dto/icell';
// import { PrismaService } from 'src/common/services/database/prisma';

@Injectable()
export class IcellAdminService {
  constructor() {}

  async getMarketers(): Promise<
    IServiceResponse<MarketersAnalyticsResponseDto[]>
  > {
    const marketersAnalyticsDummyData: MarketersAnalyticsResponseDto[] = [
      {
        name: 'Sample Marketer 1',
        totalRevenue: 10,
        totalCustomers: 145,
        totalActiveCustomers: 100,
        monthlyCustomers: 10,
      },
      {
        name: 'Sample Marketer 2',
        totalRevenue: 10,
        totalCustomers: 145,
        totalActiveCustomers: 130,
        monthlyCustomers: 10,
      },
      {
        name: 'Sample Marketer 3',
        totalRevenue: 10,
        totalCustomers: 155,
        totalActiveCustomers: 10,
        monthlyCustomers: 10,
      },
    ];
    return {
      success: true,
      message: 'Marketers analytics fetched successfully',
      data: marketersAnalyticsDummyData,
    };
  }
}
