import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { ArtworksService } from './artworks.service';

type MockPrisma = {
  artwork: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('ArtworksService', () => {
  let service: ArtworksService;
  let prisma: MockPrisma;

  const dbArtwork = {
    id: 'cm-test-id',
    title: 'Sunset Over the Ocean',
    artist: 'Claude Monet',
    type: 'painting',
    price: new Prisma.Decimal(4500),
    availability: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    prisma = {
      artwork: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [ArtworksService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(ArtworksService);
  });

  describe('Decimal → number mapping', () => {
    it('findOne returns price as a plain number, not a Decimal', async () => {
      prisma.artwork.findUnique.mockResolvedValue(dbArtwork);

      const result = await service.findOne('cm-test-id');

      expect(typeof result.price).toBe('number');
      expect(result.price).toBe(4500);
    });

    it('findAll maps price for every item in the list', async () => {
      prisma.artwork.findMany.mockResolvedValue([
        dbArtwork,
        { ...dbArtwork, id: '2', price: new Prisma.Decimal(100) },
      ]);

      const result = await service.findAll({});

      expect(result.map((a) => a.price)).toEqual([4500, 100]);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when no artwork matches the id', async () => {
      prisma.artwork.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll artist filter', () => {
    /**
     * SQLite has no `mode: 'insensitive'` in Prisma, and SQLite's own
     * LIKE/LOWER() only case-fold ASCII — so the artist filter is applied
     * in JS (Unicode-aware .toLowerCase()) after fetching, not pushed into
     * the Prisma `where` clause. These tests cover exactly the case an
     * ASCII-only filter would silently fail on.
     */
    it('matches case-insensitively, including non-ASCII characters', async () => {
      prisma.artwork.findMany.mockResolvedValue([
        dbArtwork,
        { ...dbArtwork, id: '2', artist: 'Émile Zola' },
      ]);

      const result = await service.findAll({ artist: 'émile' });

      expect(result).toHaveLength(1);
      expect(result[0].artist).toBe('Émile Zola');
    });

    it('does not push the artist filter into the Prisma where clause', async () => {
      prisma.artwork.findMany.mockResolvedValue([]);

      await service.findAll({ artist: 'Monet' });

      expect(prisma.artwork.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { type: undefined } }),
      );
    });

    it('returns every item unfiltered when artist is not provided', async () => {
      prisma.artwork.findMany.mockResolvedValue([dbArtwork]);

      const result = await service.findAll({});

      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('throws NotFoundException instead of calling update when the artwork does not exist', async () => {
      prisma.artwork.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { price: 100 })).rejects.toThrow(NotFoundException);
      expect(prisma.artwork.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException instead of calling delete when the artwork does not exist', async () => {
      prisma.artwork.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
      expect(prisma.artwork.delete).not.toHaveBeenCalled();
    });
  });
});
