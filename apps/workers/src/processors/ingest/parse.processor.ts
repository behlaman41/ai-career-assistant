import { Processor, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { ProviderRegistry } from '@ai-career/providers';
import { WorkerLogger } from '../../common/logging/worker-logger';

interface ParseJobData {
  documentId: string;
  userId: string;
  filePath: string;
  mimeType: string;
}

@Injectable()
@Processor('ingest.parse')
export class ParseProcessor {
  private readonly logger = new WorkerLogger(ParseProcessor.name);

  constructor(private providers: ProviderRegistry) {}

  @Process('parse')
  async handleParse(job: Job<ParseJobData>) {
    const { documentId, userId, filePath, mimeType } = job.data;
    const startTime = Date.now();

    this.logger.logJobStart('parse', job.id, { documentId, mimeType });

    try {
      // Fetch document from storage
      const fileBuffer = await this.providers.storage.getObject(filePath);

      // Parse document based on MIME type
      let content: string;
      if (mimeType === 'text/plain') {
        content = fileBuffer.toString('utf-8');
      } else if (mimeType === 'application/pdf') {
        // TODO: Implement PDF parsing with a proper library
        content = `PDF content extracted from ${filePath}`;
      } else {
        content = `Unsupported file type: ${mimeType}`;
      }

      // TODO: Save parsed content to database
      // TODO: Queue embedding job for the parsed content

      const duration = Date.now() - startTime;
      const result = {
        documentId,
        content,
        status: 'completed',
      };

      this.logger.logJobComplete('parse', job.id, duration, {
        documentId,
        contentLength: content.length,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logJobError('parse', job.id, error as Error, duration);
      throw error;
    }
  }
}
