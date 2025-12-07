import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} from "../controllers/authController.js";
import { verifyAuth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (or admin with invite code)
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", login);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout current user
 * @access  Private
 */
router.post("/logout", verifyAuth, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", verifyAuth, getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (name, title, avatar)
 * @access  Private
 */
router.put("/profile", verifyAuth, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put("/change-password", verifyAuth, changePassword);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (with filtering)
 * @access  Private/Admin
 */
router.get("/users", verifyAuth, isAdmin, getAllUsers);

/**
 * @route   PATCH /api/auth/users/:id/toggle-status
 * @desc    Activate/Deactivate user
 * @access  Private/Admin
 */
router.patch("/users/:id/toggle-status", verifyAuth, isAdmin, toggleUserStatus);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete("/users/:id", verifyAuth, isAdmin, deleteUser);

export default router;
