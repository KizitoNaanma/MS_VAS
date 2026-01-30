import { ApiProperty, PickType } from '@nestjs/swagger';
import { DailyScriptureDto } from 'src/shared/database/prisma/generated/dailyScripture.dto';
import { PageDto } from '../pagination';
import { UpdateDailyScriptureDto } from 'src/shared/database/prisma/generated/update-dailyScripture.dto';

export class DailyScriptureResponseDto extends PickType(DailyScriptureDto, [
  'id',
  'dayId',
  'content',
]) {}

export class AdminDailyScriptureResponseDto extends DailyScriptureResponseDto {
  @ApiProperty({
    type: () => String,
  })
  religion: string;
}

export class AdminDailyScripturePaginatedResponseDto extends PageDto<AdminDailyScriptureResponseDto> {
  @ApiProperty({
    type: () => [AdminDailyScriptureResponseDto],
  })
  data: AdminDailyScriptureResponseDto[];
}

export class AdminDailyScriptureUpdateDto extends PickType(
  UpdateDailyScriptureDto,
  ['content'],
) {}
