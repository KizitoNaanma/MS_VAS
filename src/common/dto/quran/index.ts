import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetSurahDto {
  @IsNotEmpty()
  @IsString()
  public readonly surahName: string;
}

// Responses
class SurahType {
  @ApiProperty({
    type: 'number',
  })
  number: number;

  @ApiProperty({
    type: 'string',
  })
  name: string;
}

export class GetSurahsDtoResponse {
  @ApiProperty({
    type: 'string',
  })
  message: 'Successfully retrieved surahs';

  @ApiProperty({
    type: [SurahType],
  })
  data: Array<SurahType>;
}

export class GetSurahDtoResponse {
  @ApiProperty({
    type: 'string',
  })
  message: 'Successfully retrieved surah';

  @ApiProperty({
    type: SurahType,
  })
  data: SurahType;
}
