import { STATUS_CODES, ERROR_TYPES } from "../constants/index.js";

export class AppError extends Error {
  constructor(message, statusCode = 500, errorType = ERROR_TYPES.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, STATUS_CODES.BAD_REQUEST, ERROR_TYPES.VALIDATION_ERROR);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, STATUS_CODES.UNAUTHORIZED, ERROR_TYPES.AUTHENTICATION_ERROR);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, STATUS_CODES.FORBIDDEN, ERROR_TYPES.AUTHORIZATION_ERROR);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, STATUS_CODES.NOT_FOUND, ERROR_TYPES.NOT_FOUND_ERROR);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, STATUS_CODES.CONFLICT, ERROR_TYPES.CONFLICT_ERROR);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_TYPES.DATABASE_ERROR);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service error") {
    super(message, STATUS_CODES.SERVICE_UNAVAILABLE, ERROR_TYPES.EXTERNAL_SERVICE_ERROR);
  }
}

// Error Response Formatter
export const formatErrorResponse = (error) => {
  return {
    success: false,
    statusCode: error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR,
    errorType: error.errorType || ERROR_TYPES.INTERNAL_SERVER_ERROR,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };
};

// Async handler wrapper (catches errors in async route handlers)
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
