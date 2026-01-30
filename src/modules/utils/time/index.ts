import { Injectable } from '@nestjs/common';
import {
  getDayOfYear,
  getWeek,
  getMonth,
  subDays,
  secondsToMilliseconds,
  minutesToMilliseconds,
  hoursToMilliseconds,
  milliseconds,
  minutesToSeconds,
  hoursToSeconds,
  startOfDay,
  addDays,
  differenceInSeconds,
  addYears,
  startOfYear,
  parseISO,
  addMonths,
} from 'date-fns';

@Injectable()
export class TimeUtilsService {
  convertToMilliseconds(
    unit: 'hours' | 'minutes' | 'seconds' | 'days' | 'months',
    value: number,
  ) {
    switch (unit.toLowerCase()) {
      case 'hours':
        return hoursToMilliseconds(value);
      case 'minutes':
        return minutesToMilliseconds(value);
      case 'seconds':
        return secondsToMilliseconds(value);
      case 'days':
        return milliseconds({ days: value });
      case 'months':
        return milliseconds({ months: value });
      default:
        throw new Error(
          'Invalid time unit. Supported units are "hours", "minutes", "seconds", "days", or "months".',
        );
    }
  }

  convertToSeconds(
    type: 'hours' | 'days' | 'years' | 'minutes' | 'months',
    value: number,
  ): number {
    switch (type.toLowerCase()) {
      case 'hours':
        return hoursToSeconds(value);
      case 'days':
        const start = startOfDay(new Date()); // Get the start of the current day
        const end = addDays(start, value); // Add the specified number of days
        const seconds = differenceInSeconds(end, start); // Calculate the difference in seconds
        return seconds;
      case 'years':
        const startDate = startOfYear(new Date()); // Use current year as reference
        const endDate = addYears(startDate, value);

        return differenceInSeconds(endDate, startDate);
      case 'minutes':
        return minutesToSeconds(value);
      case 'months':
        const initialDate = parseISO(new Date().toISOString());
        const futureDate = addMonths(initialDate, value);
        return differenceInSeconds(futureDate, initialDate);
      default:
        throw new Error(
          'Invalid time unit. Supported units are "hours", "minutes", "seconds", "days", "months", or "years".',
        );
    }
  }

  getDayOfYear() {
    return getDayOfYear(new Date());
  }

  getWeekOfYear() {
    return getWeek(new Date());
  }

  getMonthOfYear() {
    return getMonth(new Date());
  }

  getPreviousDaysFromToday(daysCount: number) {
    const today = new Date();
    const previousDays: Date[] = [];
    for (let i = 0; i < daysCount; i++) {
      previousDays.push(subDays(today, i));
    }
    const previousDaysOfYear = previousDays.map((day) => getDayOfYear(day));
    return previousDaysOfYear;
  }

  // Convert seconds to MM:SS
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Convert MM:SS to seconds
  parseDuration(duration: string): number {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
  }
}
