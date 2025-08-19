import { Processor, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { ProviderRegistry } from '@ai-career/providers';
import { WorkerLogger } from '../../common/logging/worker-logger';

interface EmbedJobData {
  documentId: string;
  userId: string;
  content: string;
  chunkIndex?: number;
}

@Injectable()
@Processor('ingest.embed')
export class EmbedProcessor {
  private readonly logger = new WorkerLogger(EmbedProcessor.name);

  constructor(private providers: ProviderRegistry) {}

  @Process()
  async handleEmbed(job: Job<EmbedJobData>) {
    const { documentId, userId, content, chunkIndex } = job.data;
    const startTime = Date.now();

    this.logger.logJobStart('embed', job.id, {
      documentId,
      chunkIndex,
      contentLength: content.length,
    });

    try {
      // Generate embedding using the embedding provider
      const embeddings = await this.providers.embedding.embed([content]);
      const embedding = embeddings[0];

      // TODO: Save embedding to vector database

      const duration = Date.now() - startTime;
      const result = {
        documentId,
        chunkIndex,
        embedding,
        status: 'completed',
      };

      this.logger.logJobComplete('embed', job.id, duration, {
        documentId,
        chunkIndex,
        embeddingLength: embedding.length,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logJobError('embed', job.id, error as Error, duration);
      throw error;
    }
  }
}
