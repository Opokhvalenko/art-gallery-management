import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ARTWORK_TYPES } from '../../common/constants/artwork-types.constant';

export class QueryArtworkDto {
  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort by price',
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  price?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Filter by artist (case-insensitive, partial match)' })
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiPropertyOptional({
    enum: ARTWORK_TYPES,
    description: 'Filter by artwork type (exact match; an unknown type returns an empty list)',
  })
  @IsOptional()
  @IsString()
  type?: string;
}
