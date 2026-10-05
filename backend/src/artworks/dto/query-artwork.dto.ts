import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Filter by artwork type (exact match)' })
  @IsOptional()
  @IsString()
  type?: string;
}
