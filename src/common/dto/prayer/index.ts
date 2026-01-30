import { ApiProperty, PickType } from '@nestjs/swagger';
import { DailyPrayerDto } from 'src/shared/database/prisma/generated/dailyPrayer.dto';
import { PageDto } from '../pagination';
import { UpdateDailyPrayerDto } from 'src/shared/database/prisma/generated/update-dailyPrayer.dto';

export class DailyPrayerResponseDto extends PickType(DailyPrayerDto, [
  'id',
  'dayId',
  'content',
]) {}

export class AdminDailyPrayerResponseDto extends DailyPrayerResponseDto {
  @ApiProperty({
    type: () => String,
  })
  religion: string;
}

export class AdminDailyPrayerPaginatedResponseDto extends PageDto<AdminDailyPrayerResponseDto> {
  @ApiProperty({
    type: () => [AdminDailyPrayerResponseDto],
  })
  data: AdminDailyPrayerResponseDto[];
}

export class AdminDailyPrayerUpdateDto extends PickType(UpdateDailyPrayerDto, [
  'content',
]) {}
