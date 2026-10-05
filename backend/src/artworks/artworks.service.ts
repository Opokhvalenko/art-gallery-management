import { Injectable, NotFoundException } from '@nestjs/common';
import type { Artwork } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import type { QueryArtworkDto } from './dto/query-artwork.dto';
import type { ArtworkEntity } from './entities/artwork.entity';

@Injectable()
export class ArtworksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryArtworkDto): Promise<ArtworkEntity[]> {
    const artworks = await this.prisma.artwork.findMany({
      where: {
        artist: query.artist ? { contains: query.artist } : undefined,
        type: query.type,
      },
      orderBy: query.price ? { price: query.price } : undefined,
    });
    return artworks.map((artwork) => this.toEntity(artwork));
  }

  async findOne(id: string): Promise<ArtworkEntity> {
    const artwork = await this.prisma.artwork.findUnique({ where: { id } });
    if (!artwork) {
      throw new NotFoundException(`Artwork with id "${id}" not found`);
    }
    return this.toEntity(artwork);
  }

  /**
   * Prisma returns `price` as a Decimal object, which JSON.stringify
   * serializes as a STRING (e.g. "4500") — verified empirically. Map it to
   * a plain number here so the API response matches the Artwork model.
   */
  private toEntity(artwork: Artwork): ArtworkEntity {
    return {
      ...artwork,
      price: artwork.price.toNumber(),
    };
  }
}
