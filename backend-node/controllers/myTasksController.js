import Task from "../models/Task.js";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "../utils/errorHandler.js";
import { validateRequired } from "../utils/validators.js";
import { sendSuccess } from "../utils/response.js";
import { STATUS_CODES } from "../constants/index.js";

/**
 * @desc    Get user's assigned tasks
 * @route   GET /api/my-tasks
 * @access  Private
 */
export const getMyTasks = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    search,
    dueDate,
    page = 1,
    limit = 50,
  } = req.query;

  const userId = req.user.id;

  // Base query - find tasks where user is an assignee
  const query = {
    "assignees.user": userId,
    isArchived: false,
  };

  // Apply filters
  if (status) query[`assignees.status`] = status;
  if (priority) query.priority = priority;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (dueDate) {
    const date = new Date(dueDate);
    query.dueDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lte: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("createdBy", "name email")
      .populate("assignees.user", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Task.countDocuments(query),
  ]);

  // Transform tasks to include user-specific status and progress at top level
  const transformedTasks = tasks.map((task) => {
    const taskObj = task.toObject();
    const userAssignee = task.assignees.find((a) => a.user._id.toString() === userId);
    
    return {
      ...taskObj,
      // Add user-specific fields at top level for easy access
      status: userAssignee?.status || "pending",
      progress: userAssignee?.progress || 0,
    };
  });

  sendSuccess(res, STATUS_CODES.OK, "Tasks retrieved successfully", {
    tasks: transformedTasks,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get single task with user-specific data
 * @route   GET /api/my-tasks/:taskId
 * @access  Private
 */
export const getMyTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  const task = await Task.findOne({
    _id: taskId,
    "assignees.user": userId,
  })
    .populate("createdBy", "name email")
    .populate("assignees.user", "name email avatar");

  if (!task) {
    throw new NotFoundError("Task not found or you don't have access");
  }

  // Extract only current user's assignee data
  const userAssignee = task.assignees.find(
    (a) => a.user._id.toString() === userId
  );

  const responseData = {
    _id: task._id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    tags: task.tags,
    attachments: task.attachments,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    // User-specific data
    myStatus: userAssignee.status,
    myProgress: userAssignee.progress,
    myWorkflow: userAssignee.workflow,
    myTimeSpent: userAssignee.timeSpentMinutes,
    myStartedAt: userAssignee.startedAt,
    myCompletedAt: userAssignee.completedAt,
    isTimerActive: !!userAssignee.activeTimerStartedAt,
  };

  sendSuccess(res, STATUS_CODES.OK, "Task retrieved successfully", {
    task: responseData,
  });
});

/**
 * @desc    Update user's task status
 * @route   PATCH /api/my-tasks/:taskId/status
 * @access  Private
 */
export const updateMyTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  validateRequired(status, "Status");

  if (!["pending", "in-progress", "completed"].includes(status)) {
    throw new ValidationError("Invalid status value");
  }

  const task = await Task.findOne({
    _id: taskId,
    "assignees.user": userId,
  });

  if (!task) {
    throw new NotFoundError("Task not found or you don't have access");
  }

  // Find user's assignee entry
  const assigneeIndex = task.assignees.findIndex(
    (a) => a.user.toString() === userId
  );

  if (assigneeIndex === -1) {
    throw new AuthorizationError("You are not assigned to this task");
  }

  // Update user's status
  task.assignees[assigneeIndex].status = status;

  // Update timestamps
  if (status === "in-progress" && !task.assignees[assigneeIndex].startedAt) {
    task.assignees[assigneeIndex].startedAt = new Date();
  }

  if (status === "completed") {
    task.assignees[assigneeIndex].completedAt = new Date();
    task.assignees[assigneeIndex].progress = 100;
  }

  await task.save();

  sendSuccess(res, STATUS_CODES.OK, "Status updated successfully", {
    status: task.assignees[assigneeIndex].status,
    progress: task.assignees[assigneeIndex].progress,
  });
});

/**
 * @desc    Update user's workflow
 * @route   PATCH /api/my-tasks/:taskId/workflow
 * @access  Private
 */
export const updateMyWorkflow = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { action, stepId, label, order, steps } = req.body;
  const userId = req.user.id;

  validateRequired(action, "Action");

  const task = await Task.findOne({
    _id: taskId,
    "assignees.user": userId,
  });

  if (!task) {
    throw new NotFoundError("Task not found or you don't have access");
  }

  const assigneeIndex = task.assignees.findIndex(
    (a) => a.user.toString() === userId
  );

  if (assigneeIndex === -1) {
    throw new AuthorizationError("You are not assigned to this task");
  }

  let workflow = task.assignees[assigneeIndex].workflow || [];

  switch (action) {
    case "addStep":
      if (!label) throw new ValidationError("Label is required for addStep");
      const newStepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      workflow.push({
        stepId: newStepId,
        label,
        done: false,
        order: workflow.length,
      });
      break;

    case "toggleStep":
      if (!stepId) throw new ValidationError("stepId is required for toggleStep");
      const stepIndex = workflow.findIndex((s) => s.stepId === stepId);
      if (stepIndex !== -1) {
        workflow[stepIndex].done = !workflow[stepIndex].done;
      }
      break;

    case "deleteStep":
      if (!stepId) throw new ValidationError("stepId is required for deleteStep");
      workflow = workflow.filter((s) => s.stepId !== stepId);
      break;

    case "reorder":
      if (!steps || !Array.isArray(steps)) {
        throw new ValidationError("steps array is required for reorder");
      }
      // Update order based on provided array
      steps.forEach((item, index) => {
        const step = workflow.find((s) => s.stepId === item.stepId);
        if (step) step.order = index;
      });
      workflow.sort((a, b) => a.order - b.order);
      break;

    default:
      throw new ValidationError("Invalid action");
  }

  // Update workflow
  task.assignees[assigneeIndex].workflow = workflow;

  // Recalculate progress
  const completedSteps = workflow.filter((s) => s.done).length;
  const totalSteps = workflow.length;
  task.assignees[assigneeIndex].progress =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  await task.save();

  sendSuccess(res, STATUS_CODES.OK, "Workflow updated successfully", {
    workflow: task.assignees[assigneeIndex].workflow,
    progress: task.assignees[assigneeIndex].progress,
  });
});

/**
 * @desc    Start/pause/stop timer
 * @route   PATCH /api/my-tasks/:taskId/timer
 * @access  Private
 */
export const updateTimer = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { action } = req.body;
  const userId = req.user.id;

  validateRequired(action, "Action");

  if (!["start", "pause", "stop"].includes(action)) {
    throw new ValidationError("Invalid action. Use: start, pause, or stop");
  }

  const task = await Task.findOne({
    _id: taskId,
    "assignees.user": userId,
  });

  if (!task) {
    throw new NotFoundError("Task not found or you don't have access");
  }

  const assigneeIndex = task.assignees.findIndex(
    (a) => a.user.toString() === userId
  );

  if (assigneeIndex === -1) {
    throw new AuthorizationError("You are not assigned to this task");
  }

  const assignee = task.assignees[assigneeIndex];

  switch (action) {
    case "start":
      if (assignee.activeTimerStartedAt) {
        throw new ValidationError("Timer is already running");
      }
      assignee.activeTimerStartedAt = new Date();
      break;

    case "pause":
    case "stop":
      if (!assignee.activeTimerStartedAt) {
        throw new ValidationError("Timer is not running");
      }
      
      // Calculate elapsed time
      const elapsedMs = Date.now() - assignee.activeTimerStartedAt.getTime();
      const elapsedMinutes = Math.round(elapsedMs / 60000);
      
      assignee.timeSpentMinutes += elapsedMinutes;
      assignee.activeTimerStartedAt = null;
      break;
  }

  await task.save();

  sendSuccess(res, STATUS_CODES.OK, `Timer ${action}ed successfully`, {
    timeSpentMinutes: assignee.timeSpentMinutes,
    isTimerActive: !!assignee.activeTimerStartedAt,
  });
});
