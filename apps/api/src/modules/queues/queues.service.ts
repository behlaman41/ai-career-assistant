import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

export interface ParseJobData {
  documentId: string;
  userId: string;
  filePath: string;
  mimeType: string;
}

export interface EmbedJobData {
  documentId: string;
  userId: string;
  content: string;
  chunks: string[];
}

export interface AnalysisJobData {
  runId: string;
  userId: string;
  jdId: string;
  resumeVersionId: string;
}

export interface AVScanJobData {
  documentId: string;
  storageKey: string;
}

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('ingest.parse') private parseQueue: Queue<ParseJobData>,
    @InjectQueue('ingest.embed') private embedQueue: Queue<EmbedJobData>,
    @InjectQueue('analysis.score') private analysisQueue: Queue<AnalysisJobData>,
    @InjectQueue('security.avscan') private avscanQueue: Queue<AVScanJobData>,
  ) {}
  async addParseJob(data: ParseJobData, options?: any) {
    return this.parseQueue.add('parse-document', data, {
      priority: 10,
      ...options,
    });
  }

  async addEmbedJob(data: EmbedJobData, options?: any) {
    return this.embedQueue.add('embed-content', data, {
      priority: 5,
      ...options,
    });
  }

  async addAnalysisJob(data: AnalysisJobData, options?: any) {
    return this.analysisQueue.add('score-resume', data, {
      priority: 1,
      ...options,
    });
  }

  async addAVScanJob(data: AVScanJobData, options?: any) {
    return this.avscanQueue.add('scan-file', data, {
      priority: 20,
      ...options,
    });
  }
  async getParseJobStatus(jobId: string) {
    const job = await this.parseQueue.getJob(jobId);
    return job ? { id: job.id, status: await job.getState(), progress: job.progress() } : null;
  }

  async getEmbedJobStatus(jobId: string) {
    const job = await this.embedQueue.getJob(jobId);
    return job ? { id: job.id, status: await job.getState(), progress: job.progress() } : null;
  }

  async getAnalysisJobStatus(jobId: string) {
    const job = await this.analysisQueue.getJob(jobId);
    return job ? { id: job.id, status: await job.getState(), progress: job.progress() } : null;
  }

  async getQueueStats() {
    const [parseStats, embedStats, analysisStats] = await Promise.all([
      this.parseQueue.getJobCounts(),
      this.embedQueue.getJobCounts(),
      this.analysisQueue.getJobCounts(),
    ]);

    return {
      parse: parseStats,
      embed: embedStats,
      analysis: analysisStats,
    };
  }
}
