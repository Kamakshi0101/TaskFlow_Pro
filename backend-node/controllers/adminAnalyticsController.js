import Task from '../models/Task.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { STATUS_CODES } from '../constants/index.js';
import { startOfDay, subDays, format, differenceInDays } from 'date-fns';

/**
 * @desc    Get admin analytics overview
 * @route   GET /api/analytics/admin/overview
 * @access  Private (Admin only)
 */
export const getAdminOverview = asyncHandler(async (req, res) => {
  const [totalTasks, totalUsers, tasks] = await Promise.all([
    Task.countDocuments({ isArchived: false }),
    User.countDocuments({ role: 'user' }),
    Task.find({ isArchived: false }),
  ]);

  let completedTasks = 0;
  let pendingTasks = 0;
  let totalCompletionTime = 0;
  let completedCount = 0;

  tasks.forEach((task) => {
    task.assignees.forEach((assignee) => {
      if (assignee.status === 'completed') {
        completedTasks++;
        if (assignee.completedAt) {
          // Use startedAt if available, otherwise use task createdAt
          const startTime = assignee.startedAt || task.createdAt;
          const timeDiff = differenceInDays(new Date(assignee.completedAt), new Date(startTime));
          totalCompletionTime += Math.max(timeDiff, 0);
          completedCount++;
        }
      } else {
        pendingTasks++;
      }
    });
  });

  const completionRate = (completedTasks + pendingTasks) > 0 
    ? Math.round((completedTasks / (completedTasks + pendingTasks)) * 100) 
    : 0;

  const avgCompletionTime = completedCount > 0 
    ? (totalCompletionTime / completedCount) 
    : 0;

  sendSuccess(res, STATUS_CODES.OK, 'Admin overview retrieved', {
    totalTasks,
    totalUsers,
    completedTasks,
    pendingTasks,
    completionRate,
    avgCompletionTime: parseFloat(avgCompletionTime.toFixed(1)),
  });
});

/**
 * @desc    Get team progress over time (30 days)
 * @route   GET /api/analytics/admin/team-progress
 * @access  Private (Admin only)
 */
export const getTeamProgress = asyncHandler(async (req, res) => {
  const days = 30;

  // Generate array of last 30 days
  const dateArray = [];
  for (let i = days - 1; i >= 0; i--) {
    dateArray.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  }

  // Find all tasks
  const tasks = await Task.find({ isArchived: false });

  // Count completions per day (across all users)
  const completionsByDate = {};
  dateArray.forEach((date) => {
    completionsByDate[date] = 0;
  });

  tasks.forEach((task) => {
    task.assignees.forEach((assignee) => {
      if (assignee.status === 'completed' && assignee.completedAt) {
        const dateKey = format(startOfDay(new Date(assignee.completedAt)), 'yyyy-MM-dd');
        if (completionsByDate.hasOwnProperty(dateKey)) {
          completionsByDate[dateKey]++;
        }
      }
    });
  });

  const progressData = dateArray.map((date) => ({
    date,
    count: completionsByDate[date],
  }));

  sendSuccess(res, STATUS_CODES.OK, 'Team progress data retrieved', progressData);
});

/**
 * @desc    Get priority distribution
 * @route   GET /api/analytics/admin/priority-distribution
 * @access  Private (Admin only)
 */
export const getPriorityDistribution = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ isArchived: false });

  const distribution = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };

  tasks.forEach((task) => {
    if (distribution.hasOwnProperty(task.priority)) {
      distribution[task.priority]++;
    }
  });

  const formattedData = Object.keys(distribution).map((priority) => ({
    _id: priority,
    count: distribution[priority],
  }));

  sendSuccess(res, STATUS_CODES.OK, 'Priority distribution retrieved', formattedData);
});

/**
 * @desc    Get user leaderboard
 * @route   GET /api/analytics/admin/leaderboard
 * @access  Private (Admin only)
 */
export const getLeaderboard = asyncHandler(async (req, res) => {
  const [users, tasks] = await Promise.all([
    User.find({ role: 'user' }).select('name email'),
    Task.find({ isArchived: false }),
  ]);

  const userStats = {};

  // Initialize stats for each user
  users.forEach((user) => {
    userStats[user._id.toString()] = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      tasksCompleted: 0,
      totalTasks: 0,
      totalCompletionTime: 0,
      completedCount: 0,
    };
  });

  // Calculate stats
  tasks.forEach((task) => {
    task.assignees.forEach((assignee) => {
      const userId = assignee.user.toString();
      if (userStats[userId]) {
        userStats[userId].totalTasks++;

        if (assignee.status === 'completed') {
          userStats[userId].tasksCompleted++;

          if (assignee.startedAt && assignee.completedAt) {
            const timeDiff = differenceInDays(new Date(assignee.completedAt), new Date(assignee.startedAt));
            userStats[userId].totalCompletionTime += timeDiff;
            userStats[userId].completedCount++;
          }
        }
      }
    });
  });

  // Calculate productivity scores and format data
  const leaderboard = Object.values(userStats).map((stats) => {
    const avgCompletionTime = stats.completedCount > 0 
      ? stats.totalCompletionTime / stats.completedCount 
      : 0;

    const productivityScore = stats.totalTasks > 0 
      ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) 
      : 0;

    return {
      userId: stats.user._id,
      userName: stats.user.name,
      userEmail: stats.user.email,
      tasksCompleted: stats.tasksCompleted,
      totalTasks: stats.totalTasks,
      avgCompletionTime: parseFloat(avgCompletionTime.toFixed(1)),
      productivityScore,
    };
  });

  // Sort by productivity score (descending)
  leaderboard.sort((a, b) => b.productivityScore - a.productivityScore);

  sendSuccess(res, STATUS_CODES.OK, 'Leaderboard data retrieved', leaderboard);
});

/**
 * @desc    Get bottleneck analysis (overdue, long-running, most reassigned tasks)
 * @route   GET /api/analytics/admin/bottlenecks
 * @access  Private (Admin only)
 */
export const getBottlenecks = asyncHandler(async (req, res) => {
  const now = new Date();

  const tasks = await Task.find({ isArchived: false })
    .populate('createdBy', 'name email')
    .populate('assignees.user', 'name email');

  // Overdue tasks (due date passed and not completed)
  const overdue = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const hasIncomplete = task.assignees.some((a) => a.status !== 'completed');
    return new Date(task.dueDate) < now && hasIncomplete;
  }).map((task) => ({
    _id: task._id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    assignees: task.assignees.length,
    status: task.status,
  }));

  // Long-running tasks (updated more than 7 days ago and still not completed)
  const longRunning = tasks.filter((task) => {
    const hasIncomplete = task.assignees.some((a) => a.status !== 'completed');
    const daysSinceUpdate = differenceInDays(now, new Date(task.updatedAt));
    return hasIncomplete && daysSinceUpdate > 7;
  }).map((task) => {
    const duration = differenceInDays(now, new Date(task.createdAt));
    return {
      _id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      duration,
    };
  }).sort((a, b) => b.duration - a.duration).slice(0, 10);

  // Most reassigned tasks (tasks with many assignees)
  const mostReassigned = tasks
    .filter((task) => task.assignees.length > 2)
    .map((task) => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assigneeCount: task.assignees.length,
    }))
    .sort((a, b) => b.assigneeCount - a.assigneeCount)
    .slice(0, 10);

  sendSuccess(res, STATUS_CODES.OK, 'Bottleneck analysis retrieved', {
    overdue,
    longRunning,
    mostReassigned,
  });
});
