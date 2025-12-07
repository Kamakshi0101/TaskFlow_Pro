import express from "express";
import {
  getTaskActivities,
  getUserActivities,
  getRecentActivities,
  getActivityStats,
  getActionBreakdown,
  getUserTimeline,
} from "../controllers/activityLogController.js";
import { verifyAuth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// All activity routes require authentication
router.use(verifyAuth);

// ============================================
// ACTIVITY RETRIEVAL
// ============================================

/**
 * @route   GET /api/activities/recent
 * @desc    Get recent activities across all tasks
 * @access  Private
 */
router.get("/recent", getRecentActivities);

/**
 * @route   GET /api/activities/task/:taskId
 * @desc    Get activity logs for a specific task
 * @access  Private
 */
router.get("/task/:taskId", getTaskActivities);

/**
 * @route   GET /api/activities/user/:userId
 * @desc    Get activity logs for a specific user
 * @access  Private
 */
router.get("/user/:userId", getUserActivities);

/**
 * @route   GET /api/activities/timeline/:userId
 * @desc    Get user activity timeline (grouped by date)
 * @access  Private
 */
router.get("/timeline/:userId", getUserTimeline);

// ============================================
// ACTIVITY STATISTICS (Admin Only)
// ============================================

/**
 * @route   GET /api/activities/stats
 * @desc    Get activity statistics
 * @access  Private (Admin only)
 */
router.get("/stats", isAdmin, getActivityStats);

/**
 * @route   GET /api/activities/action-breakdown
 * @desc    Get action type breakdown
 * @access  Private (Admin only)
 */
router.get("/action-breakdown", isAdmin, getActionBreakdown);

export default router;
