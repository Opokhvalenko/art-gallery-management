import { Injectable, NotFoundException } from '@nestjs/common';
import type { Artwork } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import type { CreateArtworkDto } from './dto/create-artwork.dto';
import type { QueryArtworkDto } from './dto/query-artwork.dto';
import type { UpdateArtworkDto } from './dto/update-artwork.dto';
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
    const artwork = await this.findExistingOrThrow(id);
    return this.toEntity(artwork);
  }

  async create(dto: CreateArtworkDto): Promise<ArtworkEntity> {
    const artwork = await this.prisma.artwork.create({ data: dto });
    return this.toEntity(artwork);
  }

  async update(id: string, dto: UpdateArtworkDto): Promise<ArtworkEntity> {
    await this.findExistingOrThrow(id);
    const artwork = await this.prisma.artwork.update({ where: { id }, data: dto });
    return this.toEntity(artwork);
  }

  async remove(id: string): Promise<void> {
    await this.findExistingOrThrow(id);
    await this.prisma.artwork.delete({ where: { id } });
  }

  private async findExistingOrThrow(id: string): Promise<Artwork> {
    const artwork = await this.prisma.artwork.findUnique({ where: { id } });
    if (!artwork) {
      throw new NotFoundException(`Artwork with id "${id}" not found`);
    }
    return artwork;
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
