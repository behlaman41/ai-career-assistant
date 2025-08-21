import { Processor, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service'; // Assuming PrismaModule provides this
import { UploadStatus } from '@prisma/client';
import { WorkerLogger } from '../../common/logging/worker-logger';

interface AVScanJobData {
  documentId: string;
  storageKey: string;
}

@Injectable()
@Processor('security.avscan')
export class AVScanProcessor {
  private readonly logger = new WorkerLogger(AVScanProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('scan-file')
  async handleScan(job: Job<AVScanJobData>) {
    const { documentId, storageKey } = job.data;
    const startTime = Date.now();

    this.logger.logJobStart('avscan', job.id, { documentId, storageKey });

    try {
      // Simulate AV scan (stub: always approve for now)
      const scanResult = { clean: true, details: 'No threats detected' };

      const newStatus = scanResult.clean ? UploadStatus.approved : UploadStatus.rejected;

      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: newStatus,
          scanResult: scanResult,
        },
      });

      const duration = Date.now() - startTime;
      this.logger.logJobComplete('avscan', job.id, duration, { documentId, newStatus });

      return { documentId, status: newStatus, scanResult };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logJobError('avscan', job.id, error as Error, duration);
      throw error;
    }
  }
}
