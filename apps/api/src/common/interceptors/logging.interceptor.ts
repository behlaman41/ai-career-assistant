import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params } = request;
    
    // Generate or use existing request ID
    const requestId = request.headers['x-request-id'] as string || uuidv4();
    
    // Add request ID to response headers
    response.setHeader('x-request-id', requestId);
    
    // Add request ID to request object for use in other parts of the application
    (request as any).requestId = requestId;
    
    const startTime = Date.now();
    
    this.logger.log(
      `[${requestId}] ${method} ${url} - Request started`,
      {
        requestId,
        method,
        url,
        body: this.sanitizeBody(body),
        query,
        params,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${requestId}] ${method} ${url} - ${response.statusCode} - ${duration}ms`,
            {
              requestId,
              method,
              url,
              statusCode: response.statusCode,
              duration,
              responseSize: JSON.stringify(data).length,
            }
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] ${method} ${url} - Error - ${duration}ms`,
            {
              requestId,
              method,
              url,
              duration,
              error: error.message,
              stack: error.stack,
            }
          );
        },
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}