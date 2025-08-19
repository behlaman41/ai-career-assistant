import { z } from 'zod';

export const DocumentTypeEnum = z.enum(['resume', 'jd', 'export']);
export const ChunkKindEnum = z.enum(['resume', 'jd']);
export const RunStatusEnum = z.enum(['queued', 'processing', 'done', 'failed']);
export const RunOutputTypeEnum = z.enum(['tailored_resume', 'skills', 'qa', 'scorecard']);

export const CreateUploadInitSchema = z.object({
  mime: z.string(),
  sha256: z.string().length(64),
});
export type CreateUploadInit = z.infer<typeof CreateUploadInitSchema>;

export const UploadInitResponseSchema = z.object({
  documentId: z.string().uuid(),
  signedUrl: z.string().url(),
});
export type UploadInitResponse = z.infer<typeof UploadInitResponseSchema>;

export const CreateResumeSchema = z.object({
  title: z.string().min(1),
  documentId: z.string().uuid(),
});
export type CreateResume = z.infer<typeof CreateResumeSchema>;

export const CreateResumeVersionSchema = z.object({
  documentId: z.string().uuid().optional(),
  fromRunId: z.string().uuid().optional(),
}).refine((data: { documentId?: string; fromRunId?: string }) => !!(data.documentId || data.fromRunId), {
  message: 'Either documentId or fromRunId must be provided.',
});
export type CreateResumeVersion = z.infer<typeof CreateResumeVersionSchema>;

export const CreateJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  documentId: z.string().uuid(),
});
export type CreateJob = z.infer<typeof CreateJobSchema>;

export const CreateRunSchema = z.object({
  jdId: z.string().uuid(),
  resumeVersionId: z.string().uuid(),
});
export type CreateRun = z.infer<typeof CreateRunSchema>;

export const GetRunResponseSchema = z.object({
  id: z.string().uuid(),
  status: RunStatusEnum,
  outputs: z.array(z.object({
    type: RunOutputTypeEnum,
    json: z.unknown(),
    storageKey: z.string().optional(),
  })).optional(),
});
export type GetRunResponse = z.infer<typeof GetRunResponseSchema>;