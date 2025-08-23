import { z } from 'zod';

export const DocumentTypeEnum = z.enum(['resume', 'jd', 'export']);
export const ChunkKindEnum = z.enum(['resume', 'jd']);
export const RunStatusEnum = z.enum(['queued', 'processing', 'done', 'failed']);
export const RunOutputTypeEnum = z.enum(['tailored_resume', 'skills', 'qa', 'scorecard']);

// MIME type validation - Phase 2 requirements
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

// File size limits - Phase 2 requirements
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const CreateUploadInitSchema = z.object({
  mime: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({
      message: `Invalid MIME type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }),
  }),
  sha256: z.string().length(64, { message: 'SHA256 hash must be exactly 64 characters' }),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, {
      message: `File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
    }),
  suggestedName: z.string().optional(),
});
export type CreateUploadInit = z.infer<typeof CreateUploadInitSchema>;

export const UploadInitResponseSchema = z.object({
  documentId: z.string().uuid(),
  signedUrl: z.string().url(),
  expiresAt: z.date().optional(),
});
export type UploadInitResponse = z.infer<typeof UploadInitResponseSchema>;

export const CreateResumeSchema = z.object({
  title: z.string().min(1),
  documentId: z.string().uuid(),
});
export type CreateResume = z.infer<typeof CreateResumeSchema>;

export const CreateResumeVersionSchema = z
  .object({
    documentId: z.string().uuid().optional(),
    fromRunId: z.string().uuid().optional(),
  })
  .refine(
    (data: { documentId?: string; fromRunId?: string }) => !!(data.documentId || data.fromRunId),
    {
      message: 'Either documentId or fromRunId must be provided.',
    },
  );
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
  outputs: z
    .array(
      z.object({
        type: RunOutputTypeEnum,
        json: z.unknown(),
        storageKey: z.string().optional(),
      }),
    )
    .optional(),
});
export type GetRunResponse = z.infer<typeof GetRunResponseSchema>;
