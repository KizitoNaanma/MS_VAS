import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { getS3FileUrl } from 'src/modules/utils';
import { copyNonNullFields } from 'src/modules/utils';
import { MindfulnessResourceDto } from 'src/shared/database/prisma/generated/mindfulnessResource.dto';
import { MindfulnessResourceEntity } from 'src/shared/database/prisma/generated/mindfulnessResource.entity';
import { MindfulnessResourceCategoryEntity } from 'src/shared/database/prisma/generated/mindfulnessResourceCategory.entity';
import { PageDto } from '../pagination';

export class MindfulnessResourceCategoryResponseDto extends PickType(
  MindfulnessResourceCategoryEntity,
  ['id', 'name'],
) {}

export class MindfulnessResourceResponseDto extends OmitType(
  MindfulnessResourceDto,
  ['createdAt', 'updatedAt', 'audioObjectKey'],
) {
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  audioUrl: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageUrl: string | null;

  constructor(resource: Partial<MindfulnessResourceDto>) {
    super();

    copyNonNullFields(resource, this, [
      'audioObjectKey',
      'createdAt',
      'updatedAt',
    ]);

    this.audioUrl = getS3FileUrl(resource.audioObjectKey);
    this.imageUrl = getS3FileUrl(resource.imageObjectKey);
  }
}

export class AdminMindfulnessResourceResponseDto extends PickType(
  MindfulnessResourceEntity,
  ['id', 'name', 'imageObjectKey', 'createdAt'],
) {
  @ApiProperty({
    type: () => MindfulnessResourceCategoryResponseDto,
  })
  category: MindfulnessResourceCategoryResponseDto;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  imageUrl: string | null;

  constructor(resource: Partial<MindfulnessResourceEntity>) {
    super();

    copyNonNullFields(resource, this, ['imageObjectKey']);

    this.imageUrl = getS3FileUrl(resource.imageObjectKey);
  }
}

export class AdminMindfulnessPaginatedResourceResponseDto extends PageDto<AdminMindfulnessResourceResponseDto> {
  @ApiProperty({
    type: () => [AdminMindfulnessResourceResponseDto],
  })
  data: AdminMindfulnessResourceResponseDto[];
}

export class AdminCreateMindfulnessResourceDto {
  @ApiProperty({
    type: 'string',
  })
  name: string;

  @ApiProperty({
    type: 'string',
  })
  categoryId: string;

  @ApiProperty({
    type: 'file',
    format: 'binary',
    required: false,
  })
  image?: Express.Multer.File;

  @ApiProperty({
    type: 'file',
    format: 'binary',
    required: true,
  })
  audio: Express.Multer.File;
}

export class AdminUpdateMindfulnessResourceDto extends PartialType(
  AdminCreateMindfulnessResourceDto,
) {}
