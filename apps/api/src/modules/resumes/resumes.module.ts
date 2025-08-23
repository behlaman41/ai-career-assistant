import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';

import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}
