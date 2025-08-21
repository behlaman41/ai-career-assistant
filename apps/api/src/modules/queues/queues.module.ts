import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { QueuesService } from './queues.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'ingest.parse',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'ingest.embed',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'analysis.score',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'security.avscan',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
    ),
  ],
  providers: [QueuesService],
  exports: [BullModule, QueuesService],
})
export class QueuesModule {}
