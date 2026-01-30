import { ApiProperty, PickType } from '@nestjs/swagger';
import { DailyDevotionalDto } from 'src/shared/database/prisma/generated/dailyDevotional.dto';
import { PageDto } from '../pagination';
import { UpdateDailyDevotionalDto } from 'src/shared/database/prisma/generated/update-dailyDevotional.dto';

export class DailyDevotionalResponseDto extends PickType(DailyDevotionalDto, [
  'id',
  'dayId',
  'content',
]) {}

export class AdminDailyDevotionalResponseDto extends DailyDevotionalResponseDto {
  @ApiProperty({
    type: () => String,
  })
  religion: string;
}

export class AdminDailyDevotionalPaginatedResponseDto extends PageDto<AdminDailyDevotionalResponseDto> {
  @ApiProperty({
    type: () => [AdminDailyDevotionalResponseDto],
  })
  data: AdminDailyDevotionalResponseDto[];
}

export class AdminDailyDevotionalUpdateDto extends PickType(
  UpdateDailyDevotionalDto,
  ['content'],
) {}
