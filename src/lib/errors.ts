export interface ErrorDetails {
  [key: string]: unknown;
}

export abstract class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: ErrorDetails;

  protected constructor(message: string, statusCode: number, code: string, details?: ErrorDetails) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid request.", details?: ErrorDetails) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} was not found.`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "The requested resource conflicts with existing data.", details?: ErrorDetails) {
    super(message, 409, "CONFLICT", details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "An unexpected error occurred.") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
