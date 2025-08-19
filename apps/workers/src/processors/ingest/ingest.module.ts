import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { ProvidersModule } from '../../providers/providers.module';
import { EmbedProcessor } from './embed.processor';
import { ParseProcessor } from './parse.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'ingest.parse',
      },
      {
        name: 'ingest.embed',
      },
    ),
    ProvidersModule,
  ],
  providers: [ParseProcessor, EmbedProcessor],
})
export class IngestModule {}
