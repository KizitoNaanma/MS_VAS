import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database/prisma';
import { TimeUtilsService } from '../utils';
import { Religion } from '@prisma/client';
import { IServiceResponse } from 'src/common';
import { QuoteResponseDto } from 'src/common/dto/quote';

@Injectable()
export class QuoteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timeUtils: TimeUtilsService,
  ) {}

  /**
   * Generates a deterministic seed based on time periods
   */
  private generateDeterministicSeed(
    day: number,
    week: number,
    month: number,
  ): number {
    // Combine the values in a way that creates different results for different days
    // within the same week, but repeats the pattern each month
    return day + week * 31 + month * 367;
  }

  /**
   * Returns deterministically random quotes based on a seed
   */
  private getRandomQuotes(
    quotes: QuoteResponseDto[],
    count: number,
    seed: number,
  ): QuoteResponseDto[] {
    // Create a seeded random number generator
    const seededRandom = (max: number) => {
      // Simple but deterministic random number generator
      const x = Math.sin(seed++) * 10000;
      return Math.floor((x - Math.floor(x)) * max);
    };

    // Create a copy of the quotes array
    const availableQuotes = [...quotes];
    const selected: QuoteResponseDto[] = [];

    // Select quotes using the seeded random generator
    for (let i = 0; i < Math.min(count, availableQuotes.length); i++) {
      const randomIndex = seededRandom(availableQuotes.length);
      selected.push(availableQuotes[randomIndex]);
      availableQuotes.splice(randomIndex, 1);
    }

    return selected;
  }

  /**
   * Gets deterministic set of quotes for the current day
   * @param religion - Religion to filter quotes by
   * @param count - Number of quotes to return (default: 5)
   * @returns Array of quotes
   */
  async getDailyQuotes(
    religion: Religion,
    count: number = 5,
  ): Promise<IServiceResponse> {
    // Get all quotes for the religion
    const allQuotes = await this.prisma.quote.findMany({
      where: { religionId: religion.id },
      select: {
        id: true,
        content: true,
        author: true,
      },
    });

    // Get time-based seeds
    const dayOfYear = this.timeUtils.getDayOfYear();
    const weekOfYear = this.timeUtils.getWeekOfYear();
    const monthOfYear = this.timeUtils.getMonthOfYear();

    // Generate a deterministic seed based on current time periods
    const seed = this.generateDeterministicSeed(
      dayOfYear,
      weekOfYear,
      monthOfYear,
    );

    // Get deterministically random quotes
    const selectedQuotes = this.getRandomQuotes(allQuotes, count, seed);

    return {
      success: true,
      message: 'Quotes fetched successfully',
      data: selectedQuotes,
    };
  }
}
