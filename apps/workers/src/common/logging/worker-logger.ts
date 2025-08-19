import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export class WorkerLogger extends Logger {
  private requestId: string;

  constructor(context?: string, requestId?: string) {
    super(context);
    this.requestId = requestId || uuidv4();
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  getRequestId(): string {
    return this.requestId;
  }

  log(message: any, context?: string) {
    const logMessage = this.formatMessage(message, 'LOG');
    super.log(logMessage, context || this.context);
  }

  error(message: any, trace?: string, context?: string) {
    const logMessage = this.formatMessage(message, 'ERROR');
    super.error(logMessage, trace, context || this.context);
  }

  warn(message: any, context?: string) {
    const logMessage = this.formatMessage(message, 'WARN');
    super.warn(logMessage, context || this.context);
  }

  debug(message: any, context?: string) {
    const logMessage = this.formatMessage(message, 'DEBUG');
    super.debug(logMessage, context || this.context);
  }

  verbose(message: any, context?: string) {
    const logMessage = this.formatMessage(message, 'VERBOSE');
    super.verbose(logMessage, context || this.context);
  }

  private formatMessage(message: any, level: string): string {
    const timestamp = new Date().toISOString();
    const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;
    
    return `[${this.requestId}] [${timestamp}] [${level}] ${formattedMessage}`;
  }

  // Helper method for job processing
  logJobStart(jobName: string, jobId: string | number, data?: any) {
    this.log({
      event: 'job_started',
      jobName,
      jobId,
      data: this.sanitizeData(data),
    });
  }

  logJobComplete(jobName: string, jobId: string | number, duration: number, result?: any) {
    this.log({
      event: 'job_completed',
      jobName,
      jobId,
      duration,
      result: this.sanitizeData(result),
    });
  }

  logJobError(jobName: string, jobId: string | number, error: Error, duration?: number) {
    this.error({
      event: 'job_failed',
      jobName,
      jobId,
      duration,
      error: error.message,
      stack: error.stack,
    });
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      for (const field of sensitiveFields) {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      }
      
      return sanitized;
    }
    
    return data;
  }
}