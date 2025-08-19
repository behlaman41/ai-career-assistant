import { CreateRun, GetRunResponse, RunStatusEnum, RunOutputTypeEnum } from '@ai-career/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RunStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

import { PrismaService } from '../prisma/prisma.service';
import { QueuesService } from '../queues/queues.service';

@Injectable()
export class RunsService {
  constructor(
    private prisma: PrismaService,
    private queues: QueuesService,
  ) {}

  async create(userId: string, createRunDto: CreateRun) {
    // Verify job description belongs to user
    const jd = await this.prisma.jobDescription.findFirst({
      where: { id: createRunDto.jdId, userId },
    });
    if (!jd) {
      throw new NotFoundException('Job description not found');
    }

    // Verify resume version belongs to user
    const resumeVersion = await this.prisma.resumeVersion.findFirst({
      where: {
        id: createRunDto.resumeVersionId,
        resume: { userId },
      },
      include: { resume: true },
    });
    if (!resumeVersion) {
      throw new NotFoundException('Resume version not found');
    }

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

    return run;
  }

  async findById(id: string, userId: string): Promise<GetRunResponse> {
    const run = await this.prisma.run.findFirst({
      where: { id, userId },
      include: {
        outputs: true,
      },
    });

    if (!run) {
      throw new NotFoundException('Run not found');
    }

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
    const data: { status: RunStatus; startedAt?: Date; finishedAt?: Date } = { status };
    if (startedAt) data.startedAt = startedAt;
    if (finishedAt) data.finishedAt = finishedAt;

    return this.prisma.run.update({
      where: { id },
      data,
    });
  }

  async addOutput(runId: string, type: string, json: Prisma.InputJsonValue, storageKey?: string) {
    return this.prisma.runOutput.create({
      data: {
        runId,
        type: type as z.infer<typeof RunOutputTypeEnum>,
        json,
        storageKey,
      },
    });
  }
}
