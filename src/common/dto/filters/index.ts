import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReligionEnum } from 'src/common/enum/religion';

export class SearchFilterDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class SortFilterDto {
  @ApiProperty({
    enum: ReligionEnum,
    required: false,
    description: 'Filter by religion',
  })
  @IsOptional()
  @IsEnum(ReligionEnum, {
    message: `Valid options for religion are ${Object.values(ReligionEnum)}`,
  })
  religion?: ReligionEnum;
}

export class FilterDto {
  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Search query',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    enum: ReligionEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReligionEnum, {
    message: `Valid options for religion are ${Object.values(ReligionEnum)}`,
  })
  religion?: ReligionEnum;
}
