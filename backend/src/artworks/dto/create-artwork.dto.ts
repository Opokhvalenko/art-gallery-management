import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  ARTWORK_ARTIST_MAX_LENGTH,
  ARTWORK_TITLE_MAX_LENGTH,
  ARTWORK_TYPES,
  type ArtworkType,
} from '../../common/constants/artwork-types.constant';

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateArtworkDto {
  @ApiProperty({ maxLength: ARTWORK_TITLE_MAX_LENGTH, example: 'Sunset Over the Ocean' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(ARTWORK_TITLE_MAX_LENGTH)
  title!: string;

  @ApiProperty({ maxLength: ARTWORK_ARTIST_MAX_LENGTH, example: 'Claude Monet' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(ARTWORK_ARTIST_MAX_LENGTH)
  artist!: string;

  @ApiProperty({ enum: ARTWORK_TYPES, example: 'painting' })
  @IsIn(ARTWORK_TYPES)
  type!: ArtworkType;

  @ApiProperty({ example: 4500, description: 'Must be greater than 0' })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiPropertyOptional({ default: true, description: 'Defaults to true (for sale) when omitted' })
  @IsOptional()
  @IsBoolean()
  availability?: boolean;
}
