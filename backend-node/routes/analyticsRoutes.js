import express from "express";
import {
  getDashboardStats,
  getTaskDistribution,
  getPriorityDistribution,
  getUserPerformance,
  getTasksByDateRange,
  getTimeTrackingSummary,
  getActivityStats,
  getTasksByAssignee,
} from "../controllers/analyticsController.js";
import {
  getUserOverview,
  getUserProgress30Days,
  getUserSummary,
} from "../controllers/userAnalyticsController.js";
import {
  getAdminOverview,
  getTeamProgress,
  getPriorityDistribution as getAdminPriorityDistribution,
  getLeaderboard,
  getBottlenecks,
} from "../controllers/adminAnalyticsController.js";
import { verifyAuth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// All analytics routes require authentication
router.use(verifyAuth);

// ============================================
// USER ANALYTICS ROUTES
// ============================================
router.get("/user/overview", getUserOverview);
router.get("/user/progress-30", getUserProgress30Days);
router.get("/user/summary", getUserSummary);

// ============================================
// ADMIN ANALYTICS ROUTES
// ============================================
router.get("/admin/overview", isAdmin, getAdminOverview);
router.get("/admin/team-progress", isAdmin, getTeamProgress);
router.get("/admin/priority-distribution", isAdmin, getAdminPriorityDistribution);
router.get("/admin/leaderboard", isAdmin, getLeaderboard);
router.get("/admin/bottlenecks", isAdmin, getBottlenecks);

// ============================================
// LEGACY ANALYTICS ROUTES (kept for compatibility)
// ============================================

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard statistics overview
 * @access  Private
 */
router.get("/dashboard", getDashboardStats);

/**
 * @route   GET /api/analytics/task-distribution
 * @desc    Get task count by status
 * @access  Private
 */
router.get("/task-distribution", getTaskDistribution);

/**
 * @route   GET /api/analytics/priority-distribution
 * @desc    Get task count by priority
 * @access  Private
 */
router.get("/priority-distribution", getPriorityDistribution);

/**
 * @route   GET /api/analytics/user-performance
 * @desc    Get user task performance metrics
 * @access  Private/Admin
 */
router.get("/user-performance", isAdmin, getUserPerformance);

/**
 * @route   GET /api/analytics/tasks-by-date
 * @desc    Get task counts grouped by date
 * @access  Private
 */
router.get("/tasks-by-date", getTasksByDateRange);

/**
 * @route   GET /api/analytics/time-tracking
 * @desc    Get time tracking summary for user
 * @access  Private
 */
router.get("/time-tracking", getTimeTrackingSummary);

/**
 * @route   GET /api/analytics/activity-stats
 * @desc    Get activity log statistics
 * @access  Private
 */
router.get("/activity-stats", getActivityStats);

/**
 * @route   GET /api/analytics/tasks-by-assignee
 * @desc    Get task distribution by assignee
 * @access  Private/Admin
 */
router.get("/tasks-by-assignee", isAdmin, getTasksByAssignee);

export default router;
