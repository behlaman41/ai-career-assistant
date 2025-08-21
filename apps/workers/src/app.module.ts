import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { ProvidersModule } from './providers/providers.module';
import { AnalysisModule } from './processors/analysis/analysis.module';
import { IngestModule } from './processors/ingest/ingest.module';
import { SecurityModule } from './processors/security/security.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        db: parseInt(process.env.REDIS_DB || '0'),
      },
    }),
    ProvidersModule,
    IngestModule,
    AnalysisModule,
    SecurityModule,
  ],
})
export class AppModule {}
