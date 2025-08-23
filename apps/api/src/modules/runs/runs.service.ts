import { CreateRun, GetRunResponse, RunStatusEnum, RunOutputTypeEnum } from '@ai-career/shared';
import { assertOwnership } from '@ai-career/shared/policies';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RunStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueuesService } from '../queues/queues.service';

@Injectable()
export class RunsService {
  constructor(
    private prisma: PrismaService,
    private queues: QueuesService,
    private auditService: AuditService,
  ) {}

  async create(userId: string, createRunDto: CreateRun) {
    // Verify job description belongs to user
    const jd = await this.prisma.jobDescription.findUnique({
      where: { id: createRunDto.jdId },
    });
    if (!jd) {
      throw new NotFoundException('Job description not found');
    }
    assertOwnership(userId, jd.userId);

    // Verify resume version belongs to user
    const resumeVersion = await this.prisma.resumeVersion.findUnique({
      where: { id: createRunDto.resumeVersionId },
      include: { resume: true },
    });
    if (!resumeVersion) {
      throw new NotFoundException('Resume version not found');
    }
    assertOwnership(userId, resumeVersion.resume.userId);

    const run = await this.prisma.run.create({
      data: {
        userId,
        jdId: createRunDto.jdId,
        resumeVersionId: createRunDto.resumeVersionId,
        status: 'queued',
      },
      include: {
        jd: true,
        resumeVersion: {
          include: {
            resume: true,
            document: true,
          },
        },
        outputs: true,
      },
    });

    // Trigger analysis job
    await this.queues.addAnalysisJob({
      runId: run.id,
      userId: run.userId,
      jdId: run.jdId,
      resumeVersionId: run.resumeVersionId,
    });

    await this.auditService.log(userId, 'run_created', {
      runId: run.id,
      jdId: run.jdId,
      resumeVersionId: run.resumeVersionId,
    });

    return run;
  }

  async findById(id: string, userId: string): Promise<GetRunResponse> {
    const run = await this.prisma.run.findUnique({
      where: { id },
      include: {
        outputs: true,
      },
    });

    if (!run) {
      throw new NotFoundException('Run not found');
    }
    assertOwnership(userId, run.userId);

    return {
      id: run.id,
      status: run.status as z.infer<typeof RunStatusEnum>,
      outputs: run.outputs?.map((output) => ({
        type: output.type as z.infer<typeof RunOutputTypeEnum>,
        json: output.json,
        storageKey: output.storageKey || undefined,
      })),
    };
  }

  async findByUser(userId: string) {
    return this.prisma.run.findMany({
      where: { userId },
      include: {
        jd: true,
        resumeVersion: {
          include: {
            resume: true,
          },
        },
        outputs: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: RunStatus, startedAt?: Date, finishedAt?: Date) {
    const run = await this.prisma.run.findUnique({ where: { id } });
    if (!run) {
      throw new NotFoundException('Run not found');
    }

    const data: { status: RunStatus; startedAt?: Date; finishedAt?: Date } = { status };
    if (startedAt) data.startedAt = startedAt;
    if (finishedAt) data.finishedAt = finishedAt;

    const updatedRun = await this.prisma.run.update({
      where: { id },
      data,
    });

    await this.auditService.log(run.userId, 'run_status_updated', {
      runId: id,
      oldStatus: run.status,
      newStatus: status,
      startedAt,
      finishedAt,
    });

    return updatedRun;
  }

  async addOutput(runId: string, type: string, json: Prisma.InputJsonValue, storageKey?: string) {
    const run = await this.prisma.run.findUnique({ where: { id: runId } });
    if (!run) {
      throw new NotFoundException('Run not found');
    }

    const output = await this.prisma.runOutput.create({
      data: {
        runId,
        type: type as z.infer<typeof RunOutputTypeEnum>,
        json,
        storageKey,
      },
    });

    await this.auditService.log(run.userId, 'run_output_added', {
      runId,
      outputId: output.id,
      outputType: type,
      hasStorageKey: !!storageKey,
    });

    return output;
  }
}
