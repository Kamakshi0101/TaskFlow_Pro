import Task from "../models/Task.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { sendSuccess } from "../utils/response.js";
import { STATUS_CODES, TASK_STATUS, TASK_PRIORITY } from "../constants/index.js";

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin";

  // Get task statistics
  const taskStats = await Task.getStatistics();

  // Get user-specific stats
  const userTasks = isAdmin
    ? await Task.countDocuments({ isArchived: false })
    : await Task.countDocuments({
        assignedTo: req.user._id,
        isArchived: false,
      });

  const userCompletedTasks = isAdmin
    ? taskStats.completed
    : await Task.countDocuments({
        assignedTo: req.user._id,
        status: TASK_STATUS.COMPLETED,
        isArchived: false,
      });

  // Get total users (admin only)
  const totalUsers = isAdmin ? await User.getActiveUsersCount() : 0;

  // Get recent activities
  const recentActivities = await ActivityLog.getRecentActivities(10);

  // Calculate productivity rate
  const productivityRate = userTasks > 0 
    ? Math.round((userCompletedTasks / userTasks) * 100) 
    : 0;

  sendSuccess(res, STATUS_CODES.OK, "Dashboard stats fetched successfully", {
    stats: {
      totalTasks: taskStats.total,
      completedTasks: taskStats.completed,
      pendingTasks: taskStats.pending,
      inProgressTasks: taskStats.inProgress,
      overdueTasks: taskStats.overdue,
      completionRate: taskStats.completionRate,
      totalUsers: isAdmin ? totalUsers : null,
      userTasks,
      userCompletedTasks,
      productivityRate,
    },
    recentActivities,
  });
});

/**
 * @desc    Get task distribution by status
 * @route   GET /api/analytics/task-distribution
 * @access  Private
 */
export const getTaskDistribution = asyncHandler(async (req, res) => {
  const query = req.user.role === "admin" 
    ? { isArchived: false }
    : { assignedTo: req.user._id, isArchived: false };

  const distribution = await Task.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);

  sendSuccess(res, STATUS_CODES.OK, "Task distribution fetched successfully", {
    distribution,
  });
});

/**
 * @desc    Get task distribution by priority
 * @route   GET /api/analytics/priority-distribution
 * @access  Private
 */
export const getPriorityDistribution = asyncHandler(async (req, res) => {
  const query = req.user.role === "admin"
    ? { isArchived: false }
    : { assignedTo: req.user._id, isArchived: false };

  const distribution = await Task.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        priority: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);

  sendSuccess(res, STATUS_CODES.OK, "Priority distribution fetched successfully", {
    distribution,
  });
});

/**
 * @desc    Get user performance (tasks created vs completed)
 * @route   GET /api/analytics/user-performance
 * @access  Private/Admin
 */
export const getUserPerformance = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true })
    .select("name email tasksCreated tasksCompleted")
    .lean();

  const performance = users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    tasksCreated: user.tasksCreated || 0,
    tasksCompleted: user.tasksCompleted || 0,
    completionRate:
      user.tasksCreated > 0
        ? Math.round((user.tasksCompleted / user.tasksCreated) * 100)
        : 0,
  }));

  sendSuccess(res, STATUS_CODES.OK, "User performance fetched successfully", {
    performance,
  });
});

/**
 * @desc    Get tasks by date range
 * @route   GET /api/analytics/tasks-by-date
 * @access  Private
 */
export const getTasksByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate, status, priority } = req.query;

  const query = { isArchived: false };

  // Date filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Additional filters
  if (status) query.status = status;
  if (priority) query.priority = priority;

  // User filter (non-admin sees only their tasks)
  if (req.user.role !== "admin") {
    query.assignedTo = req.user._id;
  }

  const tasks = await Task.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
        tasks: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        date: "$_id",
        count: 1,
        _id: 0,
      },
    },
    { $sort: { date: -1 } },
  ]);

  sendSuccess(res, STATUS_CODES.OK, "Tasks by date fetched successfully", {
    tasks,
  });
});

/**
 * @desc    Get time tracking summary
 * @route   GET /api/analytics/time-tracking
 * @access  Private
 */
export const getTimeTrackingSummary = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  const targetUserId = userId || req.user._id;

  // Get tasks with time logs for user
  const tasks = await Task.find({
    "timeLogs.user": targetUserId,
    isArchived: false,
  }).select("title totalTimeSpent estimatedTime timeLogs");

  const summary = {
    totalTimeLogged: 0,
    totalEstimated: 0,
    tasksTracked: tasks.length,
    tasks: [],
  };

  tasks.forEach((task) => {
    const userTimeLogs = task.timeLogs.filter(
      (log) => log.user.toString() === targetUserId.toString()
    );
    
    const taskTimeSpent = userTimeLogs.reduce(
      (sum, log) => sum + (log.duration || 0),
      0
    );

    summary.totalTimeLogged += taskTimeSpent;
    summary.totalEstimated += task.estimatedTime || 0;

    summary.tasks.push({
      id: task._id,
      title: task.title,
      timeSpent: taskTimeSpent,
      estimatedTime: task.estimatedTime,
      efficiency:
        task.estimatedTime > 0
          ? Math.round((task.estimatedTime / taskTimeSpent) * 100)
          : 0,
    });
  });

  sendSuccess(res, STATUS_CODES.OK, "Time tracking summary fetched successfully", {
    summary,
  });
});

/**
 * @desc    Get activity statistics
 * @route   GET /api/analytics/activity-stats
 * @access  Private
 */
export const getActivityStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const stats = await ActivityLog.getStatistics(startDate, endDate);

  sendSuccess(res, STATUS_CODES.OK, "Activity statistics fetched successfully", {
    stats,
  });
});

/**
 * @desc    Get tasks by assignee
 * @route   GET /api/analytics/tasks-by-assignee
 * @access  Private/Admin
 */
export const getTasksByAssignee = asyncHandler(async (req, res) => {
  const tasksByUser = await Task.aggregate([
    { $match: { isArchived: false } },
    { $unwind: "$assignedTo" },
    {
      $group: {
        _id: "$assignedTo",
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", TASK_STATUS.COMPLETED] }, 1, 0],
          },
        },
        pendingTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", TASK_STATUS.PENDING] }, 1, 0],
          },
        },
        inProgressTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", TASK_STATUS.IN_PROGRESS] }, 1, 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: "$_id",
        userName: "$user.name",
        userEmail: "$user.email",
        totalTasks: 1,
        completedTasks: 1,
        pendingTasks: 1,
        inProgressTasks: 1,
        completionRate: {
          $cond: [
            { $gt: ["$totalTasks", 0] },
            {
              $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100],
            },
            0,
          ],
        },
        _id: 0,
      },
    },
    { $sort: { totalTasks: -1 } },
  ]);

  sendSuccess(res, STATUS_CODES.OK, "Tasks by assignee fetched successfully", {
    tasksByUser,
  });
});
