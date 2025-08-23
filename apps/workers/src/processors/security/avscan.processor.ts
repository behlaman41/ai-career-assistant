import { Processor, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadStatus } from '@prisma/client';
import { ErrorFactory } from '@ai-career/shared';
import { WorkerLogger } from '../../common/logging/worker-logger';

interface AVScanJobData {
  documentId: string;
  storageKey: string;
  userId: string;
  filename?: string;
}

@Injectable()
@Processor('security.avscan')
export class AVScanProcessor {
  private readonly logger = new WorkerLogger(AVScanProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('scan-file')
  async handleScan(job: Job<AVScanJobData>) {
    const { documentId, storageKey, userId, filename } = job.data;
    const startTime = Date.now();

    this.logger.logJobStart('avscan', job.id, { documentId, storageKey, userId });

    try {
      // Fetch document to validate it exists
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw ErrorFactory.notFound('Document');
      }

      // Simulate AV scan with more realistic behavior
      const scanResult = await this.performAVScan(storageKey, filename || document.storageKey);

      const newStatus = scanResult.clean ? UploadStatus.approved : UploadStatus.rejected;

      // If virus detected, throw appropriate error
      if (!scanResult.clean && scanResult.threatType === 'virus') {
        throw ErrorFactory.virusDetected(filename || document.storageKey);
      }

      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: newStatus,
          scanResult: scanResult,
        },
      });

      const duration = Date.now() - startTime;
      this.logger.logJobComplete('avscan', job.id, duration, {
        documentId,
        newStatus,
        threatDetected: !scanResult.clean,
      });

      return { documentId, status: newStatus, scanResult };
    } catch (error) {
      // Update document status to failed if scan fails
      await this.prisma.document
        .update({
          where: { id: documentId },
          data: {
            status: UploadStatus.rejected,
            scanResult: {
              clean: false,
              details: 'Scan failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        })
        .catch(() => {
          // Ignore update errors to avoid masking original error
        });

      const duration = Date.now() - startTime;
      this.logger.logJobError('avscan', job.id, error as Error, duration);
      throw error;
    }
  }

  private async performAVScan(storageKey: string, filename: string) {
    // Simulate scan delay
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 500));

    // Simulate different scan outcomes based on filename patterns
    // This is a stub implementation for testing purposes
    const lowerFilename = filename.toLowerCase();

    // Simulate virus detection for test files
    if (lowerFilename.includes('virus') || lowerFilename.includes('malware')) {
      return {
        clean: false,
        threatType: 'virus',
        details: `Threat detected in ${filename}: Test.Virus.EICAR`,
        scanEngine: 'StubAV v1.0',
        scanTime: new Date().toISOString(),
      };
    }

    // Simulate suspicious file detection
    if (lowerFilename.includes('suspicious') || lowerFilename.includes('phishing')) {
      return {
        clean: false,
        threatType: 'suspicious',
        details: `Suspicious content detected in ${filename}`,
        scanEngine: 'StubAV v1.0',
        scanTime: new Date().toISOString(),
      };
    }

    // Default: clean file
    return {
      clean: true,
      details: 'No threats detected',
      scanEngine: 'StubAV v1.0',
      scanTime: new Date().toISOString(),
    };
  }
}
