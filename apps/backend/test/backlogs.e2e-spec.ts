import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('BacklogsController (e2e)', () => {
  let app: INestApplication;
  let backlogId: string; // will store created backlog id

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

  it('POST /backlogs - should create a backlog', async () => {
    const response = await request(app.getHttpServer())
      .post('/backlogs')
      .send({ name: 'My Backlog' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', 'My Backlog');
    expect(response.body).toHaveProperty(
      'message',
      'Backlog created successfully',
    );

    backlogId = response.body.id; // save for next tests
  });

  it('POST /backlogs/:id/items - should add item to backlog', async () => {
    const response = await request(app.getHttpServer())
      .post(`/backlogs/${backlogId}/items`)
      .send({
        externalServiceId: 123,
        name: 'Test Game',
        coverUrl: 'https://example.com/test.jpg',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('message', 'Item added successfully');
  });

  it('GET /backlogs/:id - should return backlog with added item', async () => {
    const response = await request(app.getHttpServer())
      .get(`/backlogs/${backlogId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', backlogId);
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);

    const addedItem = response.body.items.find(
      (item) => item.name === 'Test Game',
    );
    expect(addedItem).toBeDefined();
    expect(addedItem).toHaveProperty('externalServiceId', 123);
    expect(addedItem).toHaveProperty(
      'coverUrl',
      'https://example.com/test.jpg',
    );
  });

  it('GET /backlogs/unknown - should return 400', async () => {
    const response = await request(app.getHttpServer())
      .get('/backlogs/unknown')
      .expect(400);

    expect(response.body.message).toBe('Backlog not found');
  });
});
