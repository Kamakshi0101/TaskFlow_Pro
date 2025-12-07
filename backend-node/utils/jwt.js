import jwt from "jsonwebtoken";
import { AuthenticationError } from "./errorHandler.js";

/**
 * Generate JWT token
 */
export const generateToken = (userId, role) => {
  const payload = { userId, role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "7d",
  });
  return token;
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AuthenticationError("Token expired");
    }
    throw new AuthenticationError("Invalid token");
  }
};

/**
 * Decode token without verification (for payload inspection)
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new AuthenticationError("Invalid token format");
  }
};
