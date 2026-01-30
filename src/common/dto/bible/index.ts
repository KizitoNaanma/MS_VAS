import { ApiProperty } from '@nestjs/swagger';
import {
  IsLowercase,
  IsNotEmpty,
  IsNumberString,
  IsString,
} from 'class-validator';

export class GetChapterDto {
  @IsNotEmpty()
  @IsString()
  @IsLowercase()
  public readonly versionId: string;

  @IsNotEmpty()
  @IsNumberString()
  public readonly bookId: string;

  @IsNotEmpty()
  @IsNumberString()
  public readonly chapterId: string;
}

export class GetVerseDto {
  @IsNotEmpty()
  @IsString()
  public readonly versionId: string;

  @IsNotEmpty()
  @IsNumberString()
  public readonly bookId: string;

  @IsNotEmpty()
  @IsNumberString()
  public readonly chapterId: string;

  @IsNotEmpty()
  @IsNumberString()
  public readonly verseId: string;
}

export class GetChapterVerseCountDto {
  @IsNotEmpty()
  @IsNumberString()
  public readonly bookId: string;

  @IsNotEmpty()
  @IsNumberString()
  public readonly chapterId: string;
}
// Responses

export class GetBibleVersionsDtoResponse {
  @ApiProperty({
    type: 'string',
  })
  message: 'Successfully retrieved bible versions';

  @ApiProperty({
    type: 'object',
  })
  data: Array<Record<string, any>>;
}
export class GetBibleBooksDtoResponse {
  @ApiProperty({
    type: 'string',
  })
  message: 'Successfully retrieved bible books';

  @ApiProperty({
    type: 'object',
  })
  data: Array<Record<string, any>>;
}

export class GetBibleChapterDtoResponse {
  @ApiProperty({
    type: 'string',
  })
  message: 'Successfully retrieved bible chapter';

  @ApiProperty({
    type: 'object',
  })
  data: Record<string, any>;
}

export class GetChapterVerseCountDtoResponse {
  @ApiProperty({
    type: 'string',
  })
  message: 'Successfully retrieved chapter verses count';

  @ApiProperty({
    type: 'number',
  })
  data: number;
}

export class GetBibleVerseDtoResponse {
  @ApiProperty({
    type: 'string',
  })
  message: 'Successfully retrieved bible verse';

  @ApiProperty({
    type: 'object',
  })
  data: Record<string, any>;
}
