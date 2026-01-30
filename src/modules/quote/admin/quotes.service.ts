import { Injectable } from '@nestjs/common';
import { Religion } from '@prisma/client';
import {
  IServiceResponse,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/common';
import { SortFilterDto } from 'src/common/dto/filters';
import {
  AdminQuotePaginatedResponseDto,
  AdminQuoteResponseDto,
  AdminQuoteUpdateDto,
} from 'src/common/dto/quote';
import { PrismaService } from 'src/common/services/database/prisma';

@Injectable()
export class AdminQuotesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDailyQuotes(
    pageOptionsDto: PageOptionsDto,
    sortDto: SortFilterDto,
  ): Promise<IServiceResponse<AdminQuotePaginatedResponseDto>> {
    const religionFilter = sortDto.religion;
    let religion: Religion | undefined = undefined;
    if (religionFilter) {
      religion = await this.prismaService.religion.findFirst({
        where: { code: religionFilter },
      });
    }

    const whereClause = religion
      ? {
          religionId: religion?.id,
        }
      : {};

    const quotes = await this.prismaService.quote.findMany({
      where: whereClause,
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.pageSize,
      orderBy: {
        createdAt: pageOptionsDto.order,
      },
      select: {
        id: true,
        content: true,
        author: true,
        religion: true,
      },
    });

    const quotesWithSimplifiedReligion = quotes.map((quote) => ({
      ...quote,
      religion: quote.religion.name,
    }));

    const itemCount = await this.prismaService.quote.count({
      where: whereClause,
    });
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return {
      success: true,
      data: new PageDto(quotesWithSimplifiedReligion, pageMetaDto),
      message: 'Quotes fetched successfully',
    };
  }

  async getDailyQuote(
    id: string,
  ): Promise<IServiceResponse<AdminQuoteResponseDto>> {
    const quote = await this.prismaService.quote.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        author: true,
        religion: {
          select: {
            name: true,
          },
        },
      },
    });

    const quoteWithSimplifiedReligion = {
      ...quote,
      religion: quote.religion.name,
    };

    return {
      success: true,
      data: quoteWithSimplifiedReligion,
      message: 'Quote fetched successfully',
    };
  }

  async updateDailyQuote(
    id: string,
    updateQuoteDto: AdminQuoteUpdateDto,
  ): Promise<IServiceResponse<AdminQuoteResponseDto>> {
    const quote = await this.prismaService.quote.update({
      where: { id },
      data: updateQuoteDto,
      select: {
        id: true,
        content: true,
        author: true,
        religion: true,
      },
    });

    const quoteWithSimplifiedReligion = {
      ...quote,
      religion: quote.religion.name,
    };

    return {
      success: true,
      data: quoteWithSimplifiedReligion,
      message: 'Quote updated successfully',
    };
  }
}
