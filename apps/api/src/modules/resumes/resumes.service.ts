import { CreateResume, CreateResumeVersion } from '@ai-career/shared';
import { assertOwnership } from '@ai-career/shared/policies';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResumesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(userId: string, createResumeDto: CreateResume) {
    const resume = await this.prisma.resume.create({
      data: {
        userId,
        title: createResumeDto.title,
        sourceDocumentId: createResumeDto.documentId,
      },
      include: {
        versions: true,
      },
    });

    await this.auditService.log(userId, 'resume_created', {
      resumeId: resume.id,
      title: resume.title,
      sourceDocumentId: resume.sourceDocumentId,
    });

    return resume;
  }

  async findByUser(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    assertOwnership(userId, resume.userId);

    return resume;
  }

  async createVersion(resumeId: string, userId: string, createVersionDto: CreateResumeVersion) {
    // Verify resume belongs to user
    const resume = await this.findById(resumeId, userId);
    assertOwnership(userId, resume.userId);

    // Generate a label for this version
    const versionCount = await this.prisma.resumeVersion.count({
      where: { resumeId },
    });
    const label = `v${versionCount + 1}`;

    const data: any = {
      resumeId,
      label,
      parsedJson: {},
    };

    if (createVersionDto.documentId) {
      data.documentId = createVersionDto.documentId;
    }

    // Note: fromRunId logic would be implemented when Run model is complete

    const version = await this.prisma.resumeVersion.create({
      data,
      include: {
        document: true,
      },
    });

    await this.auditService.log(userId, 'resume_version_created', {
      resumeId,
      versionId: version.id,
      label,
      documentId: createVersionDto.documentId,
    });

    return version;
  }

  async update(id: string, userId: string, updateData: Partial<CreateResume>) {
    const resume = await this.findById(id, userId);
    assertOwnership(userId, resume.userId);

    const updatedResume = await this.prisma.resume.update({
      where: { id },
      data: updateData,
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    await this.auditService.log(userId, 'resume_updated', {
      resumeId: id,
      changes: updateData,
    });

    return updatedResume;
  }

  async delete(id: string, userId: string) {
    const resume = await this.findById(id, userId);
    assertOwnership(userId, resume.userId);

    const deletedResume = await this.prisma.resume.delete({
      where: { id },
    });

    await this.auditService.log(userId, 'resume_deleted', {
      resumeId: id,
      title: resume.title,
    });

    return deletedResume;
  }
}
