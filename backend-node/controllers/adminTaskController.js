import Task from "../models/Task.js";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "../utils/errorHandler.js";
import { validateRequired } from "../utils/validators.js";
import { sendSuccess } from "../utils/response.js";
import { STATUS_CODES, MESSAGES } from "../constants/index.js";

/**
 * @desc    Create a new task (Admin only)
 * @route   POST /api/tasks
 * @access  Private/Admin
 */
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, tags, attachments, assignees } = req.body;

  validateRequired(title, "Title");

  // Initialize assignees array with default values
  const initializedAssignees = (assignees || []).map((userId) => ({
    user: userId,
    status: "pending",
    progress: 0,
    workflow: [],
    timeSpentMinutes: 0,
  }));

  const task = await Task.create({
    title,
    description,
    priority: priority || "medium",
    status: "pending",
    dueDate,
    tags: tags || [],
    attachments: attachments || [],
    assignees: initializedAssignees,
    createdBy: req.user.id,
  });

  await task.populate("assignees.user", "name email");
  await task.populate("createdBy", "name email");

  sendSuccess(res, STATUS_CODES.CREATED, "Task created successfully", {
    task,
  });
});

/**
 * @desc    Get all tasks with filters (Admin only)
 * @route   GET /api/tasks
 * @access  Private/Admin
 */
export const getAllTasks = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    assignee,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  const query = { isArchived: false };

  // Apply filters
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignee) query["assignees.user"] = assignee;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("assignees.user", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Task.countDocuments(query),
  ]);

  sendSuccess(res, STATUS_CODES.OK, "Tasks retrieved successfully", {
    tasks,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get single task details (Admin only)
 * @route   GET /api/tasks/:taskId
 * @access  Private/Admin
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId)
    .populate("assignees.user", "name email avatar")
    .populate("createdBy", "name email")
    .populate("comments.author", "name email avatar");

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  sendSuccess(res, STATUS_CODES.OK, "Task retrieved successfully", { task });
});

/**
 * @desc    Update task (Admin only)
 * @route   PUT /api/tasks/:taskId
 * @access  Private/Admin
 */
export const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, dueDate, tags, attachments, assignees } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  // Update basic fields
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (tags) task.tags = tags;
  if (attachments) task.attachments = attachments;

  // Handle assignees update
  if (assignees && Array.isArray(assignees)) {
    const existingAssignees = task.assignees;
    const newAssigneeUserIds = assignees.map(id => id.toString());
    
    // Keep existing assignees that are still in the new list (preserve their workflow/progress)
    const updatedAssignees = existingAssignees.filter(assignee =>
      newAssigneeUserIds.includes(assignee.user.toString())
    );

    // Add new assignees
    const existingUserIds = existingAssignees.map(a => a.user.toString());
    const newUsers = assignees.filter(userId => !existingUserIds.includes(userId.toString()));
    
    newUsers.forEach(userId => {
      updatedAssignees.push({
        user: userId,
        status: "pending",
        progress: 0,
        workflow: [],
        timeSpentMinutes: 0,
      });
    });

    task.assignees = updatedAssignees;
  }

  await task.save();
  await task.populate("assignees.user", "name email avatar");
  await task.populate("createdBy", "name email");

  sendSuccess(res, STATUS_CODES.OK, "Task updated successfully", { task });
});

/**
 * @desc    Delete task (Admin only)
 * @route   DELETE /api/tasks/:taskId
 * @access  Private/Admin
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  await task.deleteOne();

  sendSuccess(res, STATUS_CODES.OK, "Task deleted successfully");
});

/**
 * @desc    Update task status (Admin only - for archiving etc)
 * @route   PATCH /api/tasks/:taskId/status
 * @access  Private/Admin
 */
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  validateRequired(status, "Status");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  task.status = status;
  
  if (status === "archived") {
    task.isArchived = true;
    task.archivedAt = new Date();
  }

  await task.save();

  sendSuccess(res, STATUS_CODES.OK, "Task status updated successfully", { task });
});
