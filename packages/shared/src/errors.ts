export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  ERR_INPUT_TOO_LARGE = 'ERR_INPUT_TOO_LARGE',

  // Resources
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',

  // File Upload
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  VIRUS_DETECTED = 'VIRUS_DETECTED',
  FILE_SCAN_FAILED = 'FILE_SCAN_FAILED',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // System
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Processing & Parsing
  ERR_MISSING_PARSE = 'ERR_MISSING_PARSE',

  // Business Logic
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(errorDetails: ErrorDetails) {
    super(errorDetails.message);
    this.name = 'AppError';
    this.code = errorDetails.code;
    this.statusCode = errorDetails.statusCode;
    this.details = errorDetails.details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// Predefined error factories
export const ErrorFactory = {
  unauthorized: (message = 'Unauthorized access'): AppError =>
    new AppError({
      code: ErrorCode.UNAUTHORIZED,
      message,
      statusCode: 401,
    }),

  forbidden: (message = 'Access forbidden'): AppError =>
    new AppError({
      code: ErrorCode.FORBIDDEN,
      message,
      statusCode: 403,
    }),

  notFound: (resource = 'Resource', message?: string): AppError =>
    new AppError({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: message || `${resource} not found`,
      statusCode: 404,
    }),

  validation: (message = 'Validation failed', details?: Record<string, any>): AppError =>
    new AppError({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      statusCode: 400,
      details,
    }),

  fileTooLarge: (maxSize: string): AppError =>
    new AppError({
      code: ErrorCode.FILE_TOO_LARGE,
      message: `File size exceeds maximum allowed size of ${maxSize}`,
      statusCode: 413,
    }),

  invalidFileType: (allowedTypes: string[]): AppError =>
    new AppError({
      code: ErrorCode.INVALID_FILE_TYPE,
      message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      statusCode: 400,
      details: { allowedTypes },
    }),

  rateLimitExceeded: (limit: number, window: string): AppError =>
    new AppError({
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: `Rate limit exceeded. Maximum ${limit} requests per ${window}`,
      statusCode: 429,
      details: { limit, window },
    }),

  internalError: (message = 'Internal server error'): AppError =>
    new AppError({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message,
      statusCode: 500,
    }),

  accessDenied: (message = 'Access denied'): AppError =>
    new AppError({
      code: ErrorCode.ACCESS_DENIED,
      message,
      statusCode: 403,
    }),

  virusDetected: (filename: string): AppError =>
    new AppError({
      code: ErrorCode.VIRUS_DETECTED,
      message: `Virus detected in file: ${filename}`,
      statusCode: 400,
      details: { filename },
    }),

  missingParse: (resource: string, message?: string): AppError =>
    new AppError({
      code: ErrorCode.ERR_MISSING_PARSE,
      message: message || `Missing parsed content for ${resource}`,
      statusCode: 422,
      details: { resource },
    }),

  inputTooLarge: (maxSize: string | number, actualSize?: string | number): AppError =>
    new AppError({
      code: ErrorCode.ERR_INPUT_TOO_LARGE,
      message: `Input size exceeds maximum allowed size of ${maxSize}`,
      statusCode: 413,
      details: { maxSize, actualSize },
    }),
};
