import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/http-exception.filter';
import { LoggingInterceptor } from '../src/common/logging.interceptor';
import { RawgService } from '../src/rawg/rawg.service';

const TEST_API_KEY = 'e2e-test-key';

const mockRawgService = {
  searchGames: jest.fn().mockResolvedValue({
    results: [
      { id: 1, name: 'Doom', background_image: 'https://example.com/doom.jpg' },
    ],
  }),
  getGameDetails: jest.fn().mockResolvedValue({
    id: 1,
    name: 'Doom',
    description_raw: 'A classic shooter.',
    released: '1993-12-10',
    background_image: 'https://example.com/doom.jpg',
    genres: [{ name: 'Shooter' }],
    platforms: [{ platform: { name: 'PC' } }],
  }),
};

describe('GamesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Set fallback env vars so module bootstraps without real secrets in CI.
    // RawgService is overridden below so RAWG_API_KEY is never used.
    // ClerkAuthGuard is not overridden (games are public) so CLERK_SECRET_KEY must be non-empty.
    process.env.API_KEY = TEST_API_KEY;
    process.env.RAWG_API_KEY ??= 'e2e-dummy-rawg-key';
    process.env.CLERK_SECRET_KEY ??= 'e2e-dummy-clerk-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RawgService)
      .useValue(mockRawgService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /games/search', () => {
    it('returns 400 when query param is missing', async () => {
      const res = await request(app.getHttpServer())
        .get('/games/search')
        .set('x-api-key', TEST_API_KEY);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Search query is required');
    });

    it('returns 400 when query is whitespace only', async () => {
      const res = await request(app.getHttpServer())
        .get('/games/search')
        .query({ query: '   ' })
        .set('x-api-key', TEST_API_KEY);

      expect(res.status).toBe(400);
    });

    it('returns 200 with array of results for valid query', async () => {
      const res = await request(app.getHttpServer())
        .get('/games/search')
        .query({ query: 'doom' })
        .set('x-api-key', TEST_API_KEY);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toMatchObject({ id: 1, name: 'Doom' });
    });

    it('returns 401 when API key is missing', async () => {
      const res = await request(app.getHttpServer())
        .get('/games/search')
        .query({ query: 'doom' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /games/:id', () => {
    it('returns 200 with game details for valid ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/games/1')
        .set('x-api-key', TEST_API_KEY);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 1, name: 'Doom' });
    });
  });
});
