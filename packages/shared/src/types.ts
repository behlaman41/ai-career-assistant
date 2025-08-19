// Base types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Document types
export type DocumentType = 'resume' | 'jd' | 'export';
export type MimeType = 'application/pdf' | 'text/plain' | 'application/msword';

// Resume types
export interface ParsedResume {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
  experience?: Array<{
    company: string;
    title: string;
    duration: string;
    description: string[];
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    year?: string;
  }>;
  skills?: string[];
}

// Job Description types
export interface ParsedJobDescription {
  title: string;
  company: string;
  location?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  experience?: string;
  salary?: string;
}

// Chunk types
export type ChunkKind = 'resume' | 'jd';

// Run types
export type RunStatus = 'queued' | 'processing' | 'done' | 'failed';
export type RunOutputType = 'tailored_resume' | 'skills' | 'qa' | 'scorecard';
