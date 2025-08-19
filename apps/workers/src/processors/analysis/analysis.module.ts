import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ProvidersModule } from '../../providers/providers.module';
import { ScoreProcessor } from './score.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analysis.score',
    }),
    ProvidersModule,
  ],
  providers: [ScoreProcessor],
})
export class AnalysisModule {}