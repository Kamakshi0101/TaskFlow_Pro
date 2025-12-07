import { AuthenticationError, AuthorizationError } from "../utils/errorHandler.js";
import { verifyToken } from "../utils/jwt.js";
import { ROLES } from "../constants/index.js";
import { asyncHandler } from "../utils/errorHandler.js";
import User from "../models/User.js";

/**
 * Verify JWT Token from cookies and attach user to request
 * This middleware should be used on ALL protected routes
 */
export const verifyAuth = asyncHandler(async (req, res, next) => {
  // Get token from cookie
  const token = req.cookies.token;

  if (!token) {
    throw new AuthenticationError("Authentication required. Please login.");
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Get user from database (exclude password)
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new AuthenticationError("User not found or has been deleted");
    }

    if (!user.isActive) {
      throw new AuthenticationError("User account is inactive");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError("Invalid or expired token");
  }
});

/**
 * Check if authenticated user is an admin
 * Must be used AFTER verifyAuth middleware
 */
export const isAdmin = asyncHandler((req, res, next) => {
  if (!req.user) {
    throw new AuthenticationError("Authentication required");
  }

  if (req.user.role !== ROLES.ADMIN) {
    throw new AuthorizationError("Access denied. Admin privileges required.");
  }

  next();
});

/**
 * Check if user is authenticated (alias for verifyAuth)
 * More semantic naming for route protection
 */
export const isAuthenticated = verifyAuth;

/**
 * Optional authentication - adds user to request if token exists
 * But doesn't throw error if token is missing (for public routes that have user-specific features)
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(); // No token, but that's okay
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log("Optional auth failed:", error.message);
  }

  next();
});
