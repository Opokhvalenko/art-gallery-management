import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { SEED_ARTWORKS } from '../prisma/seed-data';
import { AppModule } from '../src/app.module';
import { configureApp, createSwaggerDocument } from '../src/app.setup';
import { PRICE_MAX } from '../src/common/constants/artwork-types.constant';
import { PrismaService } from '../src/common/prisma/prisma.service';

// DATABASE_URL/FRONTEND_URL are set in test/setup-e2e.ts (runs before this
// file loads — see the comment there for why that timing matters).
// Migrations for the isolated test.db are applied via `pretest:e2e`.

describe('Artworks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
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
    it('sends security headers from helmet (same app setup as production)', async () => {
      const res = await request(app.getHttpServer()).get('/artworks').expect(200);

      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('returns the full list with price as a number, not a string', async () => {
      const res = await request(app.getHttpServer()).get('/artworks').expect(200);

      expect(res.body).toHaveLength(SEED_ARTWORKS.length);
      for (const artwork of res.body) {
        expect(typeof artwork.price).toBe('number');
      }
    });

    it('defaults to newest-first when no sort is requested', async () => {
      const created = await request(app.getHttpServer())
        .post('/artworks')
        .send({ title: 'Freshly Added', artist: 'A Reviewer', type: 'print', price: 1 })
        .expect(201);

      const res = await request(app.getHttpServer()).get('/artworks').expect(200);
      expect(res.body[0].id).toBe(created.body.id);
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
      const res = await request(app.getHttpServer()).get('/artworks?artist=vermeer').expect(200);
      expect(res.body.every((a: { artist: string }) => a.artist === 'Johannes Vermeer')).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('filters by artist case-insensitively for non-ASCII characters', async () => {
      await request(app.getHttpServer())
        .post('/artworks')
        .send({ title: 'Nana', artist: 'Émile Zola', type: 'print', price: 100 })
        .expect(201);

      const res = await request(app.getHttpServer()).get('/artworks?artist=émile').expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].artist).toBe('Émile Zola');
    });

    it('returns an empty array (not 400) for an unknown type filter', async () => {
      const res = await request(app.getHttpServer()).get('/artworks?type=unknown').expect(200);
      expect(res.body).toEqual([]);
    });

    it('combines artist and type filters with AND', async () => {
      const res = await request(app.getHttpServer())
        .get('/artworks?artist=degas&type=sculpture')
        .expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Little Dancer of Fourteen Years');
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

    it.each([0, -5, 'abc', PRICE_MAX + 1, 1e300])('rejects price=%p with 400', async (price) => {
      const res = await request(app.getHttpServer())
        .post('/artworks')
        .send({ ...valid, price })
        .expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('accepts a price with 2 decimal places', async () => {
      const res = await request(app.getHttpServer())
        .post('/artworks')
        .send({ title: 'Small Sketch', artist: 'Jane Doe', type: 'print', price: 10.55 })
        .expect(201);

      expect(res.body.price).toBe(10.55);
    });

    it('accepts the maximum price exactly', async () => {
      const res = await request(app.getHttpServer())
        .post('/artworks')
        .send({ title: 'Masterpiece', artist: 'Jane Doe', type: 'painting', price: PRICE_MAX })
        .expect(201);

      expect(res.body.price).toBe(PRICE_MAX);
    });

    it('rejects a price with more than 2 decimal places', async () => {
      const res = await request(app.getHttpServer())
        .post('/artworks')
        .send({ title: 'Small Sketch', artist: 'Jane Doe', type: 'print', price: 10.555 })
        .expect(400);

      expect(res.body.error.details[0].field).toBe('price');
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

    it('rejects a whitespace-only title as empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/artworks')
        .send({ ...valid, title: '   ' })
        .expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a whitespace-only artist as empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/artworks')
        .send({ ...valid, artist: '   ' })
        .expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('trims surrounding whitespace from a valid title and artist', async () => {
      const res = await request(app.getHttpServer())
        .post('/artworks')
        .send({ ...valid, title: '  Sunset Over the Ocean  ', artist: '  Claude Monet  ' })
        .expect(201);
      expect(res.body.title).toBe('Sunset Over the Ocean');
      expect(res.body.artist).toBe('Claude Monet');
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
    const fullBody = {
      title: 'Sunset Over the Ocean',
      artist: 'Claude Monet',
      type: 'painting',
      price: 4500,
      availability: false,
    };

    it('replaces the resource when the full body is sent', async () => {
      const list = await request(app.getHttpServer()).get('/artworks');
      const target = list.body[0];

      const res = await request(app.getHttpServer())
        .put(`/artworks/${target.id}`)
        .send(fullBody)
        .expect(200);

      expect(res.body).toMatchObject(fullBody);
    });

    it('defaults availability to true when omitted, same as POST', async () => {
      const list = await request(app.getHttpServer()).get('/artworks');
      const target = list.body.find((a: { availability: boolean }) => a.availability === false);

      const res = await request(app.getHttpServer())
        .put(`/artworks/${target.id}`)
        .send({
          title: target.title,
          artist: target.artist,
          type: target.type,
          price: target.price,
        })
        .expect(200);

      expect(res.body.availability).toBe(true);
    });

    it('rejects a partial body with 400, same validation as POST', async () => {
      const list = await request(app.getHttpServer()).get('/artworks');
      const target = list.body[0];

      const res = await request(app.getHttpServer())
        .put(`/artworks/${target.id}`)
        .send({ price: 9999 })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 for a missing id', async () => {
      await request(app.getHttpServer()).put('/artworks/does-not-exist').send(fullBody).expect(404);
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

  describe('OpenAPI document', () => {
    const errorRef = '#/components/schemas/ErrorResponseDto';

    function responseSchemaRef(
      path: string,
      method: 'get' | 'post' | 'put' | 'delete',
      status: string,
    ): unknown {
      const doc = createSwaggerDocument(app);
      const response = doc.paths[path]?.[method]?.responses?.[status] as
        | { content?: Record<string, { schema?: { $ref?: string } }> }
        | undefined;
      return response?.content?.['application/json']?.schema?.$ref;
    }

    it('documents 400 responses with the unified error schema', () => {
      expect(responseSchemaRef('/artworks', 'get', '400')).toBe(errorRef);
      expect(responseSchemaRef('/artworks', 'post', '400')).toBe(errorRef);
      expect(responseSchemaRef('/artworks/{id}', 'put', '400')).toBe(errorRef);
    });

    it('documents 404 responses with the unified error schema', () => {
      expect(responseSchemaRef('/artworks/{id}', 'get', '404')).toBe(errorRef);
      expect(responseSchemaRef('/artworks/{id}', 'put', '404')).toBe(errorRef);
      expect(responseSchemaRef('/artworks/{id}', 'delete', '404')).toBe(errorRef);
    });
  });
});
