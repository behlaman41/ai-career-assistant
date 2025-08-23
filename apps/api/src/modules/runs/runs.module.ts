import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesModule } from '../queues/queues.module';

import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';

@Module({
  imports: [PrismaModule, QueuesModule, AuditModule],
  controllers: [RunsController],
  providers: [RunsService],
  exports: [RunsService],
})
export class RunsModule {}
