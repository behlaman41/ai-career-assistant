import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { ResumesModule } from './resumes/resumes.module';
import { JobsModule } from './jobs/jobs.module';
import { RunsModule } from './runs/runs.module';
import { ProvidersModule } from './providers/providers.module';
import { QueuesModule } from './queues/queues.module';
import { validateEnv } from '../config/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    BullModule.forRoot({
      redis: (() => {
        const url = process.env.REDIS_URL || 'redis://localhost:6379/0';
        try {
          const { hostname, port } = new URL(url);
          return { host: hostname, port: parseInt(port || '6379') };
        } catch {
          return { host: 'localhost', port: 6379 };
        }
      })(),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      },
    }),
    PrismaModule,
    ProvidersModule,
    QueuesModule,
    HealthModule,
    UsersModule,
    DocumentsModule,
    ResumesModule,
    JobsModule,
    RunsModule,
  ],
})
export class AppModule {}