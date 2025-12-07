import { formatErrorResponse, AppError } from "../utils/errorHandler.js";
import { STATUS_CODES } from "../constants/index.js";

/**
 * Global error handling middleware
 * Must be defined LAST in middleware stack
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Log error details in development
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error Details:");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Validation error",
      errors: messages,
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(STATUS_CODES.CONFLICT).json({
      success: false,
      statusCode: STATUS_CODES.CONFLICT,
      message: `${field} already exists`,
    });
  }

  // Handle Mongoose cast errors
  if (err.name === "CastError") {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid ID format",
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(formatErrorResponse(err));
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Token expired",
    });
  }

  // Generic error response
  return res.status(err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR,
    message: err.message || "Internal server error",
  });
};

/**
 * 404 Not Found middleware
 * Should be defined BEFORE error handler
 */
export const notFoundHandler = (req, res, next) => {
  res.status(STATUS_CODES.NOT_FOUND).json({
    success: false,
    statusCode: STATUS_CODES.NOT_FOUND,
    message: `Route ${req.originalUrl} not found`,
  });
};
