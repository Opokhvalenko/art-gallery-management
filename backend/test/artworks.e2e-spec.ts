import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { SEED_ARTWORKS } from '../prisma/seed-data';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { validationExceptionFactory } from '../src/common/filters/validation-exception-factory';
import { PrismaService } from '../src/common/prisma/prisma.service';

// Isolated SQLite file, never touches the committed dev.db used for local
// dev / the reviewer's demo. Applied via `pretest:e2e` (prisma migrate
// deploy) before this file runs.
process.env.DATABASE_URL = 'file:./test.db';

describe('Artworks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: validationExceptionFactory,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  // Fresh, known data before every test — no test depends on another's leftovers.
  beforeEach(async () => {
    await prisma.artwork.deleteMany();
    await prisma.artwork.createMany({ data: SEED_ARTWORKS });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /artworks', () => {
    it('returns the full list with price as a number, not a string', async () => {
      const res = await request(app.getHttpServer()).get('/artworks').expect(200);

      expect(res.body).toHaveLength(SEED_ARTWORKS.length);
      for (const artwork of res.body) {
        expect(typeof artwork.price).toBe('number');
      }
    });

    it('sorts by price ascending', async () => {
      const res = await request(app.getHttpServer()).get('/artworks?price=asc').expect(200);
      const prices = res.body.map((a: { price: number }) => a.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('sorts by price descending', async () => {
      const res = await request(app.getHttpServer()).get('/artworks?price=desc').expect(200);
      const prices = res.body.map((a: { price: number }) => a.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('rejects an invalid sort value with 400', async () => {
      const res = await request(app.getHttpServer()).get('/artworks?price=sideways').expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('filters by artist case-insensitively', async () => {
      const res = await request(app.getHttpServer()).get('/artworks?artist=maria').expect(200);
      expect(res.body.every((a: { artist: string }) => a.artist === 'Maria Gonzales')).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('returns an empty array (not 400) for an unknown type filter', async () => {
      const res = await request(app.getHttpServer()).get('/artworks?type=unknown').expect(200);
      expect(res.body).toEqual([]);
    });

    it('combines artist and type filters with AND', async () => {
      const res = await request(app.getHttpServer())
        .get('/artworks?artist=liam&type=sculpture')
        .expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Silent Observer');
    });
  });

  describe('GET /artworks/:id', () => {
    it('returns a single artwork by id', async () => {
      const list = await request(app.getHttpServer()).get('/artworks');
      const target = list.body[0];

      const res = await request(app.getHttpServer()).get(`/artworks/${target.id}`).expect(200);
      expect(res.body.id).toBe(target.id);
    });

    it('returns 404 for a missing id', async () => {
      const res = await request(app.getHttpServer()).get('/artworks/does-not-exist').expect(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /artworks', () => {
    const valid = {
      title: 'Sunset Over the Ocean',
      artist: 'Claude Monet',
      type: 'painting',
      price: 4500,
    };

    it('creates an artwork and defaults availability to true when omitted', async () => {
      const res = await request(app.getHttpServer()).post('/artworks').send(valid).expect(201);
      expect(res.body.availability).toBe(true);
      expect(res.body.price).toBe(4500);
    });

    it.each([0, -5, 'abc'])('rejects price=%p with 400', async (price) => {
      const res = await request(app.getHttpServer())
        .post('/artworks')
        .send({ ...valid, price })
        .expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a title over 99 characters', async () => {
      await request(app.getHttpServer())
        .post('/artworks')
        .send({ ...valid, title: 'a'.repeat(100) })
        .expect(400);
    });

    it('accepts a title of exactly 99 characters', async () => {
      await request(app.getHttpServer())
        .post('/artworks')
        .send({ ...valid, title: 'a'.repeat(99) })
        .expect(201);
    });

    it('rejects a type outside the predefined list', async () => {
      const res = await request(app.getHttpServer())
        .post('/artworks')
        .send({ ...valid, type: 'banana' })
        .expect(400);
      expect(res.body.error.details.some((d: { field: string }) => d.field === 'type')).toBe(true);
    });
  });

  describe('PUT /artworks/:id', () => {
    it('updates only the fields sent, leaving the rest untouched', async () => {
      const list = await request(app.getHttpServer()).get('/artworks');
      const target = list.body[0];

      const res = await request(app.getHttpServer())
        .put(`/artworks/${target.id}`)
        .send({ price: 9999 })
        .expect(200);

      expect(res.body.price).toBe(9999);
      expect(res.body.title).toBe(target.title);
      expect(res.body.artist).toBe(target.artist);
    });

    it('returns 404 for a missing id', async () => {
      await request(app.getHttpServer())
        .put('/artworks/does-not-exist')
        .send({ price: 100 })
        .expect(404);
    });
  });

  describe('DELETE /artworks/:id', () => {
    it('deletes an artwork and returns 204', async () => {
      const list = await request(app.getHttpServer()).get('/artworks');
      const target = list.body[0];

      await request(app.getHttpServer()).delete(`/artworks/${target.id}`).expect(204);
      await request(app.getHttpServer()).get(`/artworks/${target.id}`).expect(404);
    });

    it('returns 404 for a missing id', async () => {
      await request(app.getHttpServer()).delete('/artworks/does-not-exist').expect(404);
    });
  });
});
