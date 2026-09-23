/**
 * Typed application errors. Every error carries a stable machine readable code
 * and an HTTP status so the API can return a consistent error envelope.
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'EMAIL_IN_USE'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'RATE_LIMITED'
  | 'QUOTA_EXCEEDED'
  | 'JOB_NOT_CANCELLABLE'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'PROVIDER_ERROR'
  | 'PROCESSING_FAILED'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;
  readonly expose: boolean;

  constructor(code: ErrorCode, message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.expose = statusCode < 500;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'The request payload is invalid.', details?: unknown) {
    super('VALIDATION_ERROR', message, 422, details);
    this.name = 'ValidationError';
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = 'Sign in to continue.') {
    super('UNAUTHENTICATED', message, 401);
    this.name = 'UnauthenticatedError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Email or password is incorrect.') {
    super('INVALID_CREDENTIALS', message, 401);
    this.name = 'InvalidCredentialsError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have access to this resource.') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', message?: string) {
    super('NOT_FOUND', message ?? `${resource} was not found.`, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'The resource already exists.', code: ErrorCode = 'CONFLICT') {
    super(code, message, 409);
    this.name = 'ConflictError';
  }
}

export class EmailInUseError extends AppError {
  constructor(message = 'An account already exists for this email address.') {
    super('EMAIL_IN_USE', message, 409);
    this.name = 'EmailInUseError';
  }
}

export class QuotaExceededError extends AppError {
  constructor(message = 'Your plan quota has been reached.', details?: unknown) {
    super('QUOTA_EXCEEDED', message, 402, details);
    this.name = 'QuotaExceededError';
  }
}

export class ProviderError extends AppError {
  constructor(provider: string, message: string, details?: unknown) {
    super('PROVIDER_ERROR', `${provider}: ${message}`, 502, details);
    this.name = 'ProviderError';
  }
}

export class ProcessingError extends AppError {
  constructor(message = 'Media processing failed.', details?: unknown) {
    super('PROCESSING_FAILED', message, 500, details);
    this.name = 'ProcessingError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}
