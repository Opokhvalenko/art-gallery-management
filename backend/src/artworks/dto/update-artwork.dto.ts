import { PartialType } from '@nestjs/swagger';
import { CreateArtworkDto } from './create-artwork.dto';

/**
 * Same fields and validation rules as CreateArtworkDto, all optional —
 * PUT supports partial updates (only the fields sent are changed).
 */
export class UpdateArtworkDto extends PartialType(CreateArtworkDto) {}
