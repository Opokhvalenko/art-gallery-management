import { Injectable, NotFoundException } from '@nestjs/common';
import { type Artwork, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import type { CreateArtworkDto } from './dto/create-artwork.dto';
import type { QueryArtworkDto } from './dto/query-artwork.dto';
import type { ArtworkEntity } from './entities/artwork.entity';

/** Prisma error code: the record targeted by update/delete does not exist. */
const PRISMA_RECORD_NOT_FOUND = 'P2025';

@Injectable()
export class ArtworksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryArtworkDto): Promise<ArtworkEntity[]> {
    const artworks = await this.prisma.artwork.findMany({
      where: {
        type: query.type,
      },
      orderBy: query.price ? { price: query.price } : { createdAt: 'desc' },
    });
    const filtered = this.filterByArtist(artworks, query.artist);
    return filtered.map((artwork) => this.toEntity(artwork));
  }

  /**
   * SQLite has no `mode: 'insensitive'` support in Prisma, and SQLite's own
   * `LIKE`/`LOWER()` only case-fold ASCII — both would silently fail to
   * match e.g. "émile" against "Émile". Filtering in JS uses
   * String.prototype.toLowerCase(), which is Unicode-aware. Fine at this
   * dataset's scale (no pagination — see README); would move to a proper
   * collation-aware query if this ever outgrew in-memory filtering.
   */
  private filterByArtist(artworks: Artwork[], artist?: string): Artwork[] {
    if (!artist) {
      return artworks;
    }
    const needle = artist.toLowerCase();
    return artworks.filter((artwork) => artwork.artist.toLowerCase().includes(needle));
  }

  async findOne(id: string): Promise<ArtworkEntity> {
    const artwork = await this.findExistingOrThrow(id);
    return this.toEntity(artwork);
  }

  async create(dto: CreateArtworkDto): Promise<ArtworkEntity> {
    const artwork = await this.prisma.artwork.create({ data: dto });
    return this.toEntity(artwork);
  }

  /**
   * PUT replaces the resource, so an omitted `availability` must resolve
   * the same way it would on create (default `true`) — Prisma's `update`
   * only applies the column default on insert, not when a key is simply
   * absent from `data`, so that default has to be applied explicitly here.
   */
  async update(id: string, dto: CreateArtworkDto): Promise<ArtworkEntity> {
    try {
      const artwork = await this.prisma.artwork.update({
        where: { id },
        data: { ...dto, availability: dto.availability ?? true },
      });
      return this.toEntity(artwork);
    } catch (error: unknown) {
      throw this.toNotFoundIfMissing(error, id);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.artwork.delete({ where: { id } });
    } catch (error: unknown) {
      throw this.toNotFoundIfMissing(error, id);
    }
  }

  /**
   * update/delete hit the database once and let Prisma report a missing
   * record (P2025) instead of a separate "does it exist?" read first — one
   * query, and no window for the row to disappear between check and write.
   */
  private toNotFoundIfMissing(error: unknown, id: string): unknown {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_RECORD_NOT_FOUND
    ) {
      return this.notFound(id);
    }
    return error;
  }

  private notFound(id: string): NotFoundException {
    return new NotFoundException(`Artwork with id "${id}" not found`);
  }

  private async findExistingOrThrow(id: string): Promise<Artwork> {
    const artwork = await this.prisma.artwork.findUnique({ where: { id } });
    if (!artwork) {
      throw this.notFound(id);
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
