// HTTP Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Response Messages
export const MESSAGES = {
  // Auth
  USER_REGISTERED: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_ALREADY_EXISTS: "User already exists",
  USER_NOT_FOUND: "User not found",
  UNAUTHORIZED: "Unauthorized access",
  INVALID_ADMIN_CODE: "Invalid admin invite code",
  TOKEN_EXPIRED: "Token expired",
  INVALID_TOKEN: "Invalid token",

  // Tasks
  TASK_CREATED: "Task created successfully",
  TASK_UPDATED: "Task updated successfully",
  TASK_DELETED: "Task deleted successfully",
  TASK_NOT_FOUND: "Task not found",
  TASKS_FETCHED: "Tasks fetched successfully",

  // General
  SUCCESS: "Request successful",
  ERROR: "Something went wrong",
  VALIDATION_ERROR: "Validation error",
  SERVER_ERROR: "Internal server error",
};

// User Roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

// Task Status
export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Task Priority
export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

// Cookie Options
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"],
};

// Error Types
export const ERROR_TYPES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  CONFLICT_ERROR: "CONFLICT_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
};
