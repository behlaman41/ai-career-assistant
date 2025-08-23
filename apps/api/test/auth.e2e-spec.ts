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

    // Clean up existing test data and related records
    await prisma.auditLog.deleteMany({
      where: {
        user: {
          email: {
            in: ['user1@example.com', 'user2@example.com'],
          },
        },
      },
    });
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            in: ['user1@example.com', 'user2@example.com'],
          },
        },
      },
    });
    await prisma.document.deleteMany({
      where: {
        user: {
          email: {
            in: ['user1@example.com', 'user2@example.com'],
          },
        },
      },
    });
    await prisma.run.deleteMany({
      where: {
        user: {
          email: {
            in: ['user1@example.com', 'user2@example.com'],
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['user1@example.com', 'user2@example.com'],
        },
      },
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
      .post('/auth/token')
      .send({ email: 'user1@example.com', password: 'password123' })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should init upload for user1', async () => {
    const response = await supertest
      .default(app.getHttpServer())
      .post('/uploads/init')
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

  describe('Authentication Flow', () => {
    it('should complete full registration → login → dashboard access flow', async () => {
      // Register new user
      const registerResponse = await supertest
        .default(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'flowtest@example.com', password: 'password123' })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('accessToken');
      expect(registerResponse.body).toHaveProperty('refreshToken');
      const { accessToken, refreshToken } = registerResponse.body;

      // Login with same credentials
      const loginResponse = await supertest
        .default(app.getHttpServer())
        .post('/auth/token')
        .send({ email: 'flowtest@example.com', password: 'password123' })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body).toHaveProperty('refreshToken');

      // Access protected dashboard/documents endpoint
      await supertest
        .default(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      // Access audit logs (dashboard feature)
      await supertest
        .default(app.getHttpServer())
        .get('/audit/logs')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);
    });

    it('should refresh tokens successfully', async () => {
      // Register user for refresh test
      const registerResponse = await supertest
        .default(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'refreshtest@example.com', password: 'password123' })
        .expect(201);

      const { refreshToken } = registerResponse.body;

      // Refresh tokens
      const refreshResponse = await supertest
        .default(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body).toHaveProperty('refreshToken');
      expect(refreshResponse.body.accessToken).not.toBe(registerResponse.body.accessToken);
    });

    it('should logout successfully and invalidate refresh token', async () => {
      // Register user for logout test
      const registerResponse = await supertest
        .default(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'logouttest@example.com', password: 'password123' })
        .expect(201);

      const { refreshToken } = registerResponse.body;

      // Logout
      await supertest
        .default(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Try to use refresh token after logout (should fail)
      await supertest
        .default(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });

    it('should reject invalid credentials', async () => {
      await supertest
        .default(app.getHttpServer())
        .post('/auth/token')
        .send({ email: 'user1@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject duplicate email registration', async () => {
      await supertest
        .default(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'user1@example.com', password: 'password123' })
        .expect(400);
    });

    it('should reject access without token', async () => {
      await supertest.default(app.getHttpServer()).get('/documents').expect(401);
    });

    it('should reject access with invalid token', async () => {
      await supertest
        .default(app.getHttpServer())
        .get('/documents')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject expired refresh token', async () => {
      await supertest
        .default(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'expired-or-invalid-token' })
        .expect(401);
    });
  });

  describe('Cross-tenant Access Control', () => {
    it('should allow user1 to access their own documents', async () => {
      await supertest
        .default(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);
    });

    it('should prevent user2 from accessing user1 documents', async () => {
      // Get user1's documents
      const user1Docs = await supertest
        .default(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // User2 should only see their own documents (empty list)
      const user2Docs = await supertest
        .default(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      // Verify user2 doesn't see user1's documents
      expect(user2Docs.body).toEqual(expect.any(Array));
      expect(user2Docs.body.length).toBe(0);
    });

    it('should allow user1 to access their own runs', async () => {
      await supertest
        .default(app.getHttpServer())
        .get('/runs')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);
    });

    it('should prevent user2 from accessing user1 runs', async () => {
      // Get user1's runs
      const user1Runs = await supertest
        .default(app.getHttpServer())
        .get('/runs')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // User2 should only see their own runs (empty list)
      const user2Runs = await supertest
        .default(app.getHttpServer())
        .get('/runs')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      // Verify user2 doesn't see user1's runs
      expect(user2Runs.body).toEqual(expect.any(Array));
      expect(user2Runs.body.length).toBe(0);
    });
  });

  afterAll(async () => {
    // Clean up test data in correct order to avoid foreign key constraints
    const testEmails = [
      'user1@example.com',
      'user2@example.com',
      'flowtest@example.com',
      'refreshtest@example.com',
      'logouttest@example.com',
    ];

    // Delete related records first
    await prisma.auditLog.deleteMany({
      where: {
        user: {
          email: { in: testEmails },
        },
      },
    });

    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: { in: testEmails },
        },
      },
    });

    await prisma.document.deleteMany({
      where: {
        user: {
          email: { in: testEmails },
        },
      },
    });

    await prisma.run.deleteMany({
      where: {
        user: {
          email: { in: testEmails },
        },
      },
    });

    // Finally delete users
    await prisma.user.deleteMany({
      where: {
        email: { in: testEmails },
      },
    });

    await app.close();
  });
});
