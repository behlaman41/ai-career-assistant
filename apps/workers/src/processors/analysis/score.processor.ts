import { Processor, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { ProviderRegistry } from '@ai-career/providers';
import { WorkerLogger } from '../../common/logging/worker-logger';

interface ScoreJobData {
  runId: string;
  userId: string;
  jdId: string;
  resumeVersionId: string;
}

@Injectable()
@Processor('analysis.score')
export class ScoreProcessor {
  private readonly logger = new WorkerLogger(ScoreProcessor.name);

  constructor(private providers: ProviderRegistry) {}

  @Process()
  async handleScore(job: Job<ScoreJobData>) {
    const { runId, userId, jdId, resumeVersionId } = job.data;
    const startTime = Date.now();

    this.logger.logJobStart('score', job.id, { runId, userId, jdId, resumeVersionId });

    try {
      // TODO: Fetch job description and resume content from database
      const jobDescription = `Sample job description for ${jdId}`;
      const resumeContent = `Sample resume content for ${resumeVersionId}`;

      // Use LLM to analyze compatibility
      const prompt = `Analyze the compatibility between this job description and resume. Provide a score from 0-100 and detailed feedback.\n\nJob Description:\n${jobDescription}\n\nResume:\n${resumeContent}\n\nProvide your analysis:`;

      const analysis = await this.providers.llm.complete(prompt, {
        temperature: 0.3,
        maxTokens: 500,
      });

      // Extract score from analysis (simplified)
      const score = Math.floor(Math.random() * 100); // TODO: Parse actual score from LLM response
      const feedback = analysis;

      const duration = Date.now() - startTime;
      const result = {
        runId,
        score,
        feedback,
        status: 'completed',
      };

      this.logger.logJobComplete('score', job.id, duration, { runId, score });

      // TODO: Save results to database

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logJobError('score', job.id, error as Error, duration);
      throw error;
    }
  }
}
