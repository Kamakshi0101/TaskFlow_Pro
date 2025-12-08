import Task from '../models/Task.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { STATUS_CODES } from '../constants/index.js';
import { startOfDay, subDays, format, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';

/**
 * @desc    Get user analytics overview
 * @route   GET /api/analytics/user/overview
 * @access  Private
 */
export const getUserOverview = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const tasks = await Task.find({
    'assignees.user': userId,
    isArchived: false,
  });

  let total = 0;
  let pending = 0;
  let inProgress = 0;
  let completed = 0;

  tasks.forEach((task) => {
    const assignee = task.assignees.find((a) => a.user.toString() === userId);
    if (assignee) {
      total++;
      if (assignee.status === 'pending') pending++;
      else if (assignee.status === 'in-progress') inProgress++;
      else if (assignee.status === 'completed') completed++;
    }
  });

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  sendSuccess(res, STATUS_CODES.OK, 'User overview retrieved', {
    total,
    pending,
    inProgress,
    completed,
    completionRate,
  });
});

/**
 * @desc    Get user's 30-day progress data
 * @route   GET /api/analytics/user/progress-30
 * @access  Private
 */
export const getUserProgress30Days = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const days = 30;

  // Generate array of last 30 days
  const dateArray = [];
  for (let i = days - 1; i >= 0; i--) {
    dateArray.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  }

  // Find all completed tasks by this user
  const tasks = await Task.find({
    'assignees.user': userId,
    'assignees.status': 'completed',
    isArchived: false,
  });

  // Count completions per day
  const completionsByDate = {};
  dateArray.forEach((date) => {
    completionsByDate[date] = 0;
  });

  tasks.forEach((task) => {
    const assignee = task.assignees.find((a) => a.user.toString() === userId);
    if (assignee && assignee.completedAt) {
      const dateKey = format(startOfDay(new Date(assignee.completedAt)), 'yyyy-MM-dd');
      if (completionsByDate.hasOwnProperty(dateKey)) {
        completionsByDate[dateKey]++;
      }
    }
  });

  const progressData = dateArray.map((date) => ({
    date,
    count: completionsByDate[date],
  }));

  sendSuccess(res, STATUS_CODES.OK, '30-day progress data retrieved', progressData);
});

/**
 * @desc    Get user's heatmap data (for calendar view)
 * @route   GET /api/analytics/user/heatmap
 * @access  Private
 */
export const getUserHeatmap = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get all completed tasks
  const tasks = await Task.find({
    'assignees.user': userId,
    'assignees.status': 'completed',
    isArchived: false,
  });

  const heatmapData = {};

  tasks.forEach((task) => {
    const assignee = task.assignees.find((a) => a.user.toString() === userId);
    if (assignee && assignee.completedAt) {
      const dateKey = format(startOfDay(new Date(assignee.completedAt)), 'yyyy-MM-dd');
      heatmapData[dateKey] = (heatmapData[dateKey] || 0) + 1;
    }
  });

  const formattedData = Object.keys(heatmapData).map((date) => ({
    date,
    count: heatmapData[date],
  }));

  sendSuccess(res, STATUS_CODES.OK, 'Heatmap data retrieved', formattedData);
});

/**
 * @desc    Get user's weekly summary with insights
 * @route   GET /api/analytics/user/summary
 * @access  Private
 */
export const getUserSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get all completed tasks
  const tasks = await Task.find({
    'assignees.user': userId,
    'assignees.status': 'completed',
    isArchived: false,
  });

  const completedDates = [];
  tasks.forEach((task) => {
    const assignee = task.assignees.find((a) => a.user.toString() === userId);
    if (assignee && assignee.completedAt) {
      completedDates.push(new Date(assignee.completedAt));
    }
  });

  // Sort dates
  completedDates.sort((a, b) => a - b);

  // Calculate streak
  let currentStreak = 0;
  if (completedDates.length > 0) {
    const today = startOfDay(new Date());
    let checkDate = today;
    let found = true;

    while (found) {
      found = completedDates.some((date) => {
        return differenceInDays(startOfDay(date), checkDate) === 0;
      });
      if (found) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      }
    }
  }

  // Find best/worst days of week
  const dayStats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  completedDates.forEach((date) => {
    const day = date.getDay();
    dayStats[day]++;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDay = 'N/A';
  let bestDayCount = 0;
  let worstDay = 'N/A';
  let worstDayCount = Infinity;

  Object.keys(dayStats).forEach((day) => {
    if (dayStats[day] > bestDayCount) {
      bestDayCount = dayStats[day];
      bestDay = dayNames[day];
    }
    if (dayStats[day] < worstDayCount && completedDates.length > 0) {
      worstDayCount = dayStats[day];
      worstDay = dayNames[day];
    }
  });

  // Calculate average tasks per week
  const weeks = Math.ceil(completedDates.length / 7) || 1;
  const avgTasksPerWeek = Math.round(completedDates.length / weeks);

  // Generate insights
  const insights = [];
  if (bestDayCount > 0) {
    insights.push(`You're most productive on ${bestDay}s with ${bestDayCount} tasks completed.`);
  }
  if (currentStreak > 0) {
    insights.push(`You're on a ${currentStreak}-day completion streak! Keep it up!`);
  }
  if (avgTasksPerWeek > 5) {
    insights.push(`You average ${avgTasksPerWeek} tasks per week - great pace!`);
  } else if (avgTasksPerWeek > 0) {
    insights.push(`Try to increase your completion rate to boost productivity.`);
  }

  sendSuccess(res, STATUS_CODES.OK, 'User summary retrieved', {
    bestDay,
    bestDayCount,
    worstDay,
    worstDayCount,
    currentStreak,
    avgTasksPerWeek,
    totalCompleted: completedDates.length,
    insights,
  });
});
