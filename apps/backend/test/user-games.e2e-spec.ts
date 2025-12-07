import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserGamesController (e2e)', () => {
  let app: INestApplication;
  const testUserId = 'test-user-123';
  let gameId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/:userId/games - should return empty array initially', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${testUserId}/games`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /users/:userId/games - should add a game', async () => {
    const response = await request(app.getHttpServer())
      .post(`/users/${testUserId}/games`)
      .send({
        externalServiceId: '12345',
        name: 'Test Game',
        coverUrl: 'https://example.com/cover.jpg',
        status: 'backlog',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('userId', testUserId);
    expect(response.body).toHaveProperty('name', 'Test Game');
    expect(response.body).toHaveProperty('status', 'backlog');

    gameId = response.body.id;
  });

  it('POST /users/:userId/games - should reject invalid status', async () => {
    const response = await request(app.getHttpServer())
      .post(`/users/${testUserId}/games`)
      .send({
        externalServiceId: '99999',
        name: 'Another Game',
        status: 'invalid-status',
      })
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('GET /users/:userId/games - should return added game', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${testUserId}/games`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const addedGame = response.body.find((g) => g.id === gameId);
    expect(addedGame).toBeDefined();
    expect(addedGame.name).toBe('Test Game');
  });

  it('PATCH /users/:userId/games/:gameId/status - should update status', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/${testUserId}/games/${gameId}/status`)
      .send({ status: 'playing' })
      .expect(200);

    expect(response.body).toHaveProperty('status', 'playing');
  });

  it('PATCH /users/:userId/games/:gameId/status - should return 404 for unknown game', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/${testUserId}/games/00000000-0000-0000-0000-000000000000/status`)
      .send({ status: 'played' })
      .expect(404);

    expect(response.body.message).toBe('Game not found for this user');
  });

  it('DELETE /users/:userId/games/:gameId - should remove the game', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${testUserId}/games/${gameId}`)
      .expect(200);

    // Verify it's gone
    const response = await request(app.getHttpServer())
      .get(`/users/${testUserId}/games`)
      .expect(200);

    const deletedGame = response.body.find((g) => g.id === gameId);
    expect(deletedGame).toBeUndefined();
  });

  it('DELETE /users/:userId/games/:gameId - should return 404 for unknown game', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/users/${testUserId}/games/00000000-0000-0000-0000-000000000000`)
      .expect(404);

    expect(response.body.message).toBe('Game not found for this user');
  });
});
