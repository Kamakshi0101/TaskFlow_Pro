import { ValidationError } from "./errorHandler.js";

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
  return true;
};

// Password validation (min 6 chars, should contain uppercase, lowercase, number)
export const validatePassword = (password) => {
  if (password.length < 6) {
    throw new ValidationError("Password must be at least 6 characters");
  }
  if (!/[A-Z]/.test(password)) {
    throw new ValidationError("Password must contain at least one uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
    throw new ValidationError("Password must contain at least one number");
  }
  return true;
};

// Required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === "") {
    throw new ValidationError(`${fieldName} is required`);
  }
  return true;
};

// String length validation
export const validateStringLength = (value, fieldName, min = 1, max = Infinity) => {
  if (value.length < min || value.length > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max} characters`
    );
  }
  return true;
};

// Pagination validation
export const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  if (pageNum < 1) {
    throw new ValidationError("Page must be greater than 0");
  }
  if (limitNum < 1 || limitNum > 100) {
    throw new ValidationError("Limit must be between 1 and 100");
  }

  return { page: pageNum, limit: limitNum };
};

// MongoDB ObjectId validation
export const validateMongoId = (id) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ValidationError("Invalid ID format");
  }
  return true;
};
