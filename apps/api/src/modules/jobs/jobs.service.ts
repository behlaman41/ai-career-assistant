import { CreateJob } from '@ai-career/shared';
import { assertOwnership } from '@ai-career/shared/policies';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(userId: string, createJobDto: CreateJob) {
    const job = await this.prisma.jobDescription.create({
      data: {
        userId,
        title: createJobDto.title,
        company: createJobDto.company,
        sourceDocumentId: createJobDto.documentId,
        parsedJson: {},
      },
      include: {
        sourceDocument: true,
      },
    });

    await this.auditService.log(userId, 'job_created', {
      jobId: job.id,
      title: job.title,
      company: job.company,
      sourceDocumentId: job.sourceDocumentId,
    });

    return job;
  }

  async findByUser(userId: string) {
    return this.prisma.jobDescription.findMany({
      where: { userId },
      include: {
        sourceDocument: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const job = await this.prisma.jobDescription.findUnique({
      where: { id },
      include: {
        sourceDocument: true,
        runs: {
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job description not found');
    }

    assertOwnership(userId, job.userId);

    return job;
  }

  async update(id: string, userId: string, updateData: Partial<CreateJob>) {
    const job = await this.findById(id, userId);
    assertOwnership(userId, job.userId);

    const data: any = {};
    if (updateData.title) data.title = updateData.title;
    if (updateData.company) data.company = updateData.company;
    if (updateData.documentId) data.sourceDocumentId = updateData.documentId;

    const updatedJob = await this.prisma.jobDescription.update({
      where: { id },
      data,
      include: {
        sourceDocument: true,
      },
    });

    await this.auditService.log(userId, 'job_updated', {
      jobId: id,
      changes: updateData,
    });

    return updatedJob;
  }

  async delete(id: string, userId: string) {
    const job = await this.findById(id, userId);
    assertOwnership(userId, job.userId);

    const deletedJob = await this.prisma.jobDescription.delete({
      where: { id },
    });

    await this.auditService.log(userId, 'job_deleted', {
      jobId: id,
      title: job.title,
      company: job.company,
    });

    return deletedJob;
  }
}
