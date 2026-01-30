import { ApiProperty, PickType } from '@nestjs/swagger';
import { QuoteEntity } from 'src/shared/database/prisma/generated/quote.entity';
import { PageDto } from '../pagination';
import { UpdateQuoteDto } from 'src/shared/database/prisma/generated/update-quote.dto';

export class QuoteResponseDto extends PickType(QuoteEntity, [
  'id',
  'content',
  'author',
]) {}

export class AdminQuoteResponseDto extends QuoteResponseDto {
  @ApiProperty({
    type: () => String,
  })
  religion: string;
}

export class AdminQuotePaginatedResponseDto extends PageDto<AdminQuoteResponseDto> {
  @ApiProperty({
    type: () => [AdminQuoteResponseDto],
  })
  data: AdminQuoteResponseDto[];
}

export class AdminQuoteUpdateDto extends PickType(UpdateQuoteDto, [
  'content',
  'author',
]) {}
