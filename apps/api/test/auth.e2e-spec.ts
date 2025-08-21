import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';

import { AppModule } from '../src/modules/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Auth and Access Control (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up test users
    await prisma.user.deleteMany({
      where: { email: { in: ['user1@example.com', 'user2@example.com'] } },
    });

    // Register user1
    const reg1 = await supertest
      .default(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user1@example.com', password: 'password123' });
    user1Token = reg1.body.accessToken;
    user1Id = reg1.body.id; // Assuming response includes user id

    // Register user2
    const reg2 = await supertest
      .default(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user2@example.com', password: 'password123' });
    user2Token = reg2.body.accessToken;
    user2Id = reg2.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login existing user', async () => {
    const response = await supertest
      .default(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user1@example.com', password: 'password123' })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should init upload for user1', async () => {
    const response = await supertest
      .default(app.getHttpServer())
      .post('/documents/init-upload')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ mime: 'application/pdf', sha256: 'abc123', sizeBytes: 1024 })
      .expect(201);

    expect(response.body).toHaveProperty('documentId');
    expect(response.body).toHaveProperty('signedUrl');
  });

  it("should prevent user2 from accessing user1's documents", async () => {
    // First, get user1's documents with user1 token
    const user1Docs = await supertest
      .default(app.getHttpServer())
      .get('/documents')
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);

    const docId = user1Docs.body[0]?.id; // Assuming there's at least one
    if (docId) {
      await supertest
        .default(app.getHttpServer())
        .get(`/documents/${docId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404); // Or 403, depending on implementation
    }
  });

  // Add more tests for refresh, logout, rate limiting, etc.
});
