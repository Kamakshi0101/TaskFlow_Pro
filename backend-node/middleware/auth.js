// Placeholder for authentication middleware
// Will be implemented in the next step

import { AuthenticationError, AuthorizationError } from "../utils/errorHandler.js";
import { verifyToken } from "../utils/jwt.js";
import { ROLES } from "../constants/index.js";
import { asyncHandler } from "../utils/errorHandler.js";

/**
 * Verify JWT Token from cookies
 * Adds user info to req.user
 */
export const verifyAuth = asyncHandler((req, res, next) => {
  // TODO: Implement in next step
  next();
});

/**
 * Check if user is admin
 */
export const isAdmin = asyncHandler((req, res, next) => {
  // TODO: Implement in next step
  next();
});

/**
 * Check if user is authenticated
 */
export const isAuthenticated = asyncHandler((req, res, next) => {
  // TODO: Implement in next step
  next();
});
