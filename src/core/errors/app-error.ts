export type AppErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'DB'
  | 'UNEXPECTED';

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AppError';
    this.code = code;
  }
}

export class ValidationError extends AppError {
  readonly issues: readonly string[];

  constructor(message: string, issues: readonly string[] = []) {
    super('VALIDATION', message);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super('NOT_FOUND', `${entity} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

export class DbError extends AppError {
  constructor(message: string, options?: { cause?: unknown }) {
    super('DB', message, options);
    this.name = 'DbError';
  }
}

export function toAppError(e: unknown): AppError {
  if (e instanceof AppError) return e;
  if (e instanceof Error) return new AppError('UNEXPECTED', e.message, { cause: e });
  return new AppError('UNEXPECTED', String(e));
}
