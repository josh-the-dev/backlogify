import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ClerkAuthGuard } from '../src/auth';
import { AllExceptionsFilter } from '../src/common/http-exception.filter';
import { LoggingInterceptor } from '../src/common/logging.interceptor';

const TEST_API_KEY = 'e2e-test-key';
const TEST_USER_ID = 'e2e-test-user-999';

// Bypasses Clerk JWT verification and injects a deterministic userId.
const mockClerkGuard = {
  canActivate: (ctx: ExecutionContext) => {
    ctx.switchToHttp().getRequest().userId = TEST_USER_ID;
    return true;
  },
};

describe('UserGamesController (e2e)', () => {
  let app: INestApplication;
  let createdGameId: string;

  beforeAll(async () => {
    process.env.API_KEY = TEST_API_KEY;
    process.env.RAWG_API_KEY ??= 'e2e-dummy-rawg-key';
    process.env.CLERK_SECRET_KEY ??= 'e2e-dummy-clerk-key';
    process.env.CLERK_PUBLISHABLE_KEY ??= 'e2e-dummy-clerk-publishable-key';
    process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/backlogify_test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue(mockClerkGuard)
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
    // Clean up any games created for the test user during this run.
    await request(app.getHttpServer())
      .get('/user-games')
      .set('x-api-key', TEST_API_KEY)
      .then(async (res) => {
        const games = Array.isArray(res.body) ? res.body : [];
        for (const game of games) {
          await request(app.getHttpServer())
            .delete(`/user-games/${game.id}`)
            .set('x-api-key', TEST_API_KEY);
        }
      });

    await app.close();
  });

  describe('GET /user-games', () => {
    it('returns 200 with an array', async () => {
      const res = await request(app.getHttpServer())
        .get('/user-games')
        .set('x-api-key', TEST_API_KEY);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns 401 when API key is missing', async () => {
      const res = await request(app.getHttpServer()).get('/user-games');
      expect(res.status).toBe(401);
    });

    it('accepts limit and offset query params', async () => {
      const res = await request(app.getHttpServer())
        .get('/user-games')
        .query({ limit: 10, offset: 0 })
        .set('x-api-key', TEST_API_KEY);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns 400 for invalid pagination params', async () => {
      const res = await request(app.getHttpServer())
        .get('/user-games')
        .query({ limit: 999 })
        .set('x-api-key', TEST_API_KEY);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /user-games', () => {
    it('returns 201 and the created game', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-games')
        .set('x-api-key', TEST_API_KEY)
        .send({
          externalServiceId: 'rawg-12345',
          name: 'E2E Test Game',
          coverUrl: 'https://example.com/cover.jpg',
          status: 'backlog',
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        userId: TEST_USER_ID,
        name: 'E2E Test Game',
        status: 'backlog',
      });
      expect(res.body.id).toBeDefined();
      createdGameId = res.body.id;
    });

    it('returns 400 for invalid status value', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-games')
        .set('x-api-key', TEST_API_KEY)
        .send({ externalServiceId: '999', name: 'Bad Game', status: 'wishlist' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-games')
        .set('x-api-key', TEST_API_KEY)
        .send({ status: 'backlog' });

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /user-games/:gameId', () => {
    it('returns 200 and updated game with new status', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/user-games/${createdGameId}`)
        .set('x-api-key', TEST_API_KEY)
        .send({ status: 'playing' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: createdGameId, status: 'playing' });
      expect(res.body.finishedAt).toBeNull();
    });

    it('stamps finishedAt when status moves to played', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/user-games/${createdGameId}`)
        .set('x-api-key', TEST_API_KEY)
        .send({ status: 'played' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('played');
      expect(res.body.finishedAt).toEqual(expect.any(String));
    });

    it('clears finishedAt when status moves to abandoned', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/user-games/${createdGameId}`)
        .set('x-api-key', TEST_API_KEY)
        .send({ status: 'abandoned' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('abandoned');
      expect(res.body.finishedAt).toBeNull();
    });

    it('updates and clears the note', async () => {
      const setRes = await request(app.getHttpServer())
        .patch(`/user-games/${createdGameId}`)
        .set('x-api-key', TEST_API_KEY)
        .send({ note: 'Stopped at the final boss' });

      expect(setRes.status).toBe(200);
      expect(setRes.body.note).toBe('Stopped at the final boss');

      const clearRes = await request(app.getHttpServer())
        .patch(`/user-games/${createdGameId}`)
        .set('x-api-key', TEST_API_KEY)
        .send({ note: null });

      expect(clearRes.status).toBe(200);
      expect(clearRes.body.note).toBeNull();
    });

    it('returns 400 for an empty body', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/user-games/${createdGameId}`)
        .set('x-api-key', TEST_API_KEY)
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 400 for an invalid status', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/user-games/${createdGameId}`)
        .set('x-api-key', TEST_API_KEY)
        .send({ status: 'wishlist' });

      expect(res.status).toBe(400);
    });

    it('returns 404 for a non-existent game', async () => {
      const res = await request(app.getHttpServer())
        .patch('/user-games/00000000-0000-0000-0000-000000000000')
        .set('x-api-key', TEST_API_KEY)
        .send({ status: 'played' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Game not found for this user');
    });
  });

  describe('DELETE /user-games/:gameId', () => {
    it('returns 204 when game is successfully removed', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/user-games/${createdGameId}`)
        .set('x-api-key', TEST_API_KEY);

      expect(res.status).toBe(204);
    });

    it('returns 404 when game does not exist', async () => {
      const res = await request(app.getHttpServer())
        .delete('/user-games/00000000-0000-0000-0000-000000000000')
        .set('x-api-key', TEST_API_KEY);

      expect(res.status).toBe(404);
    });
  });
});
