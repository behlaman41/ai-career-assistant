import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';

import { AppModule } from '../src/modules/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('JWT Debug (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let configService: ConfigService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = app.get<JwtService>(JwtService);
    configService = app.get<ConfigService>(ConfigService);
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    console.log('JWT_SECRET from config:', configService.get('JWT_SECRET'));
    console.log('NODE_ENV:', configService.get('NODE_ENV'));
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and validate JWT token', async () => {
    const payload = { sub: 'test-user-id', role: 'USER' };
    const token = jwtService.sign(payload);
    console.log('Generated token:', token);

    const decoded = jwtService.verify(token);
    console.log('Decoded token:', decoded);

    expect(decoded.sub).toBe('test-user-id');
    expect(decoded.role).toBe('USER');
  });

  it('should register user and get valid token', async () => {
    // Clean up test user and related records first
    await prisma.auditLog.deleteMany({
      where: { user: { email: 'debug@example.com' } },
    });
    await prisma.refreshToken.deleteMany({
      where: { user: { email: 'debug@example.com' } },
    });
    await prisma.user.deleteMany({
      where: { email: 'debug@example.com' },
    });

    const response = await supertest
      .default(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'debug@example.com', password: 'password123' })
      .expect(201);

    console.log('Registration response:', response.body);
    expect(response.body).toHaveProperty('accessToken');

    const token = response.body.accessToken;
    const decoded = jwtService.verify(token);
    console.log('Decoded registration token:', decoded);
  });
});
