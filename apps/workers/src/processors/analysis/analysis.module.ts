import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ProvidersModule } from '../../providers/providers.module';
import { ScoreProcessor } from './score.processor';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analysis.score',
    }),
    ProvidersModule,
    PrismaModule,
  ],
  providers: [ScoreProcessor],
})
export class AnalysisModule {}
