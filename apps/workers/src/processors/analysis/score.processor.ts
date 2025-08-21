import { Processor, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { ProviderRegistry } from '@ai-career/providers';
import { WorkerLogger } from '../../common/logging/worker-logger';
import { PrismaService } from '../../prisma/prisma.service';

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

  constructor(
    private providers: ProviderRegistry,
    private prisma: PrismaService,
  ) {}

  @Process()
  async handleScore(job: Job<ScoreJobData>) {
    const { runId, userId, jdId, resumeVersionId } = job.data;
    const startTime = Date.now();

    this.logger.logJobStart('score', job.id, { runId, userId, jdId, resumeVersionId });

    try {
      // Update run status to processing
      await this.prisma.run.update({ where: { id: runId }, data: { status: 'processing' } });

      // Fetch job description and resume version
      const jd = await this.prisma.jobDescription.findUnique({ where: { id: jdId } });
      const resumeVersion = await this.prisma.resumeVersion.findUnique({
        where: { id: resumeVersionId },
      });

      // Guardrail: Check for missing parsedJson
      if (!jd || !jd.parsedJson) {
        throw new Error('Missing parsed JSON for job description');
      }
      if (!resumeVersion || !resumeVersion.parsedJson) {
        throw new Error('Missing parsed JSON for resume version');
      }

      // Guardrail: Check input size
      const maxSize = 100000; // e.g., 100KB
      if (
        JSON.stringify(jd.parsedJson).length > maxSize ||
        JSON.stringify(resumeVersion.parsedJson).length > maxSize
      ) {
        throw new Error('Input too large for analysis');
      }

      const jobDescription = JSON.stringify(jd.parsedJson);
      const resumeContent = JSON.stringify(resumeVersion.parsedJson);

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

      // Save results and update run status
      await this.prisma.runOutput.create({
        data: {
          runId,
          type: 'scorecard',
          json: { score, feedback },
        },
      });
      await this.prisma.run.update({ where: { id: runId }, data: { status: 'done' } });

      this.logger.logJobComplete('score', job.id, duration, { runId, score });

      return result;
    } catch (error) {
      await this.prisma.run.update({ where: { id: runId }, data: { status: 'failed' } });
      const duration = Date.now() - startTime;
      this.logger.logJobError('score', job.id, error as Error, duration);
      throw error;
    }
  }
}
