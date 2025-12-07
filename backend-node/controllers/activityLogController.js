import ActivityLog from "../models/ActivityLog.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { NotFoundError, ValidationError } from "../utils/errorHandler.js";
import { validateMongoId, validatePagination } from "../utils/validators.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { STATUS_CODES } from "../constants/index.js";

/**
 * @desc    Get activity logs for a specific task
 * @route   GET /api/activities/task/:taskId
 * @access  Private
 */
export const getTaskActivities = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  validateMongoId(taskId, "Task ID");
  validatePagination(page, limit);

  // Verify task exists
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const activities = await ActivityLog.find({ task: taskId })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

  const total = await ActivityLog.countDocuments({ task: taskId });

  sendPaginated(
    res,
    STATUS_CODES.OK,
    "Task activities retrieved successfully",
    activities,
    parseInt(page),
    parseInt(limit),
    total
  );
});

/**
 * @desc    Get activity logs for a specific user
 * @route   GET /api/activities/user/:userId
 * @access  Private
 */
export const getUserActivities = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, actionType } = req.query;

  validateMongoId(userId, "User ID");
  validatePagination(page, limit);

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Only allow users to view their own activities, unless admin
  if (
    req.user._id.toString() !== userId &&
    req.user.role !== "admin"
  ) {
    throw new ValidationError(
      "You can only view your own activity history"
    );
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build filter
  const filter = { user: userId };
  if (actionType) {
    filter.action = actionType;
  }

  const activities = await ActivityLog.find(filter)
    .populate("task", "title status priority")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

  const total = await ActivityLog.countDocuments(filter);

  sendPaginated(
    res,
    STATUS_CODES.OK,
    "User activities retrieved successfully",
    activities,
    parseInt(page),
    parseInt(limit),
    total
  );
});

/**
 * @desc    Get recent activities across all tasks
 * @route   GET /api/activities/recent
 * @access  Private
 */
export const getRecentActivities = asyncHandler(async (req, res) => {
  const { limit = 50, actionType } = req.query;

  // Build filter
  const filter = {};
  if (actionType) {
    filter.action = actionType;
  }

  // If not admin, only show activities for tasks user is involved in
  if (req.user.role !== "admin") {
    const userTasks = await Task.find({
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id },
      ],
    }).select("_id");

    filter.task = { $in: userTasks.map((t) => t._id) };
  }

  const activities = await ActivityLog.find(filter)
    .populate("user", "name email")
    .populate("task", "title status priority")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  sendSuccess(
    res,
    STATUS_CODES.OK,
    "Recent activities retrieved successfully",
    { activities, count: activities.length }
  );
});

/**
 * @desc    Get activity statistics
 * @route   GET /api/activities/stats
 * @access  Private (Admin only)
 */
export const getActivityStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, userId } = req.query;

  // Build filter
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  if (userId) {
    validateMongoId(userId, "User ID");
    filter.user = userId;
  }

  const stats = await ActivityLog.getStatistics(filter);

  sendSuccess(
    res,
    STATUS_CODES.OK,
    "Activity statistics retrieved successfully",
    { stats }
  );
});

/**
 * @desc    Get action type breakdown
 * @route   GET /api/activities/action-breakdown
 * @access  Private (Admin only)
 */
export const getActionBreakdown = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Build filter
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const breakdown = await ActivityLog.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const total = breakdown.reduce((sum, item) => sum + item.count, 0);

  const result = breakdown.map((item) => ({
    action: item._id,
    count: item.count,
    percentage: ((item.count / total) * 100).toFixed(2),
  }));

  sendSuccess(
    res,
    STATUS_CODES.OK,
    "Action breakdown retrieved successfully",
    { breakdown: result, total }
  );
});

/**
 * @desc    Get user activity timeline
 * @route   GET /api/activities/timeline/:userId
 * @access  Private
 */
export const getUserTimeline = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { days = 30 } = req.query;

  validateMongoId(userId, "User ID");

  // Only allow users to view their own timeline, unless admin
  if (
    req.user._id.toString() !== userId &&
    req.user.role !== "admin"
  ) {
    throw new ValidationError("You can only view your own timeline");
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const activities = await ActivityLog.find({
    user: userId,
    createdAt: { $gte: startDate },
  })
    .populate("task", "title status priority")
    .sort({ createdAt: -1 })
    .lean();

  // Group by date
  const timeline = activities.reduce((acc, activity) => {
    const date = activity.createdAt.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {});

  sendSuccess(
    res,
    STATUS_CODES.OK,
    "User timeline retrieved successfully",
    { timeline, days: parseInt(days), totalActivities: activities.length }
  );
});
