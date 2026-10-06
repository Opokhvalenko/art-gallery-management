import { ApiProperty } from '@nestjs/swagger';
import { ARTWORK_TYPES } from '../../common/constants/artwork-types.constant';

/**
 * API response shape. `price` is a plain number here — Prisma returns it as
 * a Decimal object that serializes to a STRING in JSON, so the service maps
 * it to a number before this entity is returned (see artworks.service.ts).
 */
export class ArtworkEntity {
  @ApiProperty({ example: 'cmuuyh1x00000rton7b580ubs' })
  id!: string;

  @ApiProperty({ example: 'Sunset Over the Ocean' })
  title!: string;

  @ApiProperty({ example: 'Claude Monet' })
  artist!: string;

  @ApiProperty({ enum: ARTWORK_TYPES, example: 'painting' })
  type!: string;

  @ApiProperty({ example: 4500 })
  price!: number;

  @ApiProperty({ example: true })
  availability!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
