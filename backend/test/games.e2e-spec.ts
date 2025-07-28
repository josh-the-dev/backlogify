import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('GamesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('should return 400 if query param is missing', async () => {
    const res = await request(app.getHttpServer()).get('/games/search');
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Search query is required');
  });

  it('should return results when query param is valid', async () => {
    const res = await request(app.getHttpServer())
      .get('/games/search')
      .query({ query: 'doom' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
