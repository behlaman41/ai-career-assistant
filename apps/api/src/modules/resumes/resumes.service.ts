import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResume, CreateResumeVersion } from '@ai-career/shared';

@Injectable()
export class ResumesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createResumeDto: CreateResume) {
    return this.prisma.resume.create({
      data: {
        userId,
        title: createResumeDto.title,
        sourceDocumentId: createResumeDto.documentId,
      },
      include: {
        versions: true,
      },
    });
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
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  async createVersion(resumeId: string, userId: string, createVersionDto: CreateResumeVersion) {
    // Verify resume belongs to user
    const resume = await this.findById(resumeId, userId);

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

    return this.prisma.resumeVersion.create({
      data,
      include: {
        document: true,
      },
    });
  }

  async update(id: string, userId: string, updateData: Partial<CreateResume>) {
    // Verify resume belongs to user
    await this.findById(id, userId);

    return this.prisma.resume.update({
      where: { id },
      data: updateData,
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    // Verify resume belongs to user
    await this.findById(id, userId);

    return this.prisma.resume.delete({
      where: { id },
    });
  }
}