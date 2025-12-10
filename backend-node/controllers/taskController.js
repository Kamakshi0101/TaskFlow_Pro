import Task from "../models/Task.js";
import ActivityLog from "../models/ActivityLog.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "../utils/errorHandler.js";
import {
  validateRequired,
  validateStringLength,
  validatePagination,
  validateMongoId,
} from "../utils/validators.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { STATUS_CODES, MESSAGES, TASK_STATUS, TASK_PRIORITY } from "../constants/index.js";

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    priority,
    status,
    assignedTo,
    dueDate,
    startDate,
    tags,
    estimatedTime,
    subtasks,
  } = req.body;

  // Validation
  validateRequired(title, "Title");
  validateStringLength(title, "Title", 3, 200);

  if (description) {
    validateStringLength(description, "Description", 0, 2000);
  }

  // Validate assignees exist
  if (assignedTo && assignedTo.length > 0) {
    for (const userId of assignedTo) {
      validateMongoId(userId);
      const user = await User.findById(userId);
      if (!user) {
        throw new ValidationError(`User with ID ${userId} not found`);
      }
    }
  }

  // Create task
  const task = await Task.create({
    title,
    description,
    priority: priority || TASK_PRIORITY.MEDIUM,
    status: status || TASK_STATUS.PENDING,
    assignedTo: assignedTo || [],
    createdBy: req.user._id,
    dueDate,
    startDate,
    tags: tags || [],
    estimatedTime,
    subtasks: subtasks || [],
  });

  // Populate references
  await task.populate("assignedTo createdBy", "name email avatar");

  // Log activity
  await ActivityLog.logActivity({
    task: task._id,
    user: req.user._id,
    action: "created",
    description: `Created task "${task.title}"`,
  });

  sendSuccess(res, STATUS_CODES.CREATED, MESSAGES.TASK_CREATED, { task });
});

/**
 * @desc    Get all tasks with filtering and pagination
 * @route   GET /api/tasks
 * @access  Private
 */
export const getAllTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    assignedTo,
    createdBy,
    search,
    tags,
    isOverdue,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Validate pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  // Build query
  const query = { isArchived: false };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (createdBy) query.createdBy = createdBy;
  if (tags) {
    const tagArray = tags.split(",");
    query.tags = { $in: tagArray };
  }

  // Search in title and description
  if (search) {
    query.$text = { $search: search };
  }

  // Filter overdue tasks
  if (isOverdue === "true") {
    query.dueDate = { $lt: new Date() };
    query.status = { $ne: TASK_STATUS.COMPLETED };
  }

  // Calculate skip
  const skip = (validPage - 1) * validLimit;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query
  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .sort(sort)
      .skip(skip)
      .limit(validLimit),
    Task.countDocuments(query),
  ]);

  sendPaginated(res, tasks, total, validPage, validLimit, MESSAGES.TASKS_FETCHED);
});

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);

  const task = await Task.findById(id)
    .populate("assignedTo", "name email avatar title")
    .populate("createdBy", "name email avatar title")
    .populate("comments.author", "name email avatar")
    .populate("subtasks.completedBy", "name email avatar")
    .populate("timeLogs.user", "name email avatar")
    .populate("attachments.uploadedBy", "name email avatar");

  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  sendSuccess(res, STATUS_CODES.OK, "Task fetched successfully", { task });
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  const {
    title,
    description,
    status,
    priority,
    dueDate,
    startDate,
    tags,
    estimatedTime,
  } = req.body;

  // Track changes for activity log
  const changes = [];

  if (title && title !== task.title) {
    changes.push({ field: "title", oldValue: task.title, newValue: title });
    task.title = title;
  }

  if (description !== undefined && description !== task.description) {
    changes.push({
      field: "description",
      oldValue: task.description,
      newValue: description,
    });
    task.description = description;
  }

  if (status && status !== task.status) {
    changes.push({ field: "status", oldValue: task.status, newValue: status });
    task.status = status;
    
    if (status === TASK_STATUS.COMPLETED) {
      task.completedAt = new Date();
    } else if (status !== TASK_STATUS.COMPLETED) {
      // Clear completedAt if moving away from completed status
      task.completedAt = null;
    }
  }

  if (priority && priority !== task.priority) {
    changes.push({
      field: "priority",
      oldValue: task.priority,
      newValue: priority,
    });
    task.priority = priority;
  }

  if (dueDate !== undefined) {
    changes.push({
      field: "dueDate",
      oldValue: task.dueDate,
      newValue: dueDate,
    });
    task.dueDate = dueDate;
  }

  if (startDate !== undefined) {
    task.startDate = startDate;
  }

  if (tags !== undefined) {
    task.tags = tags;
  }

  if (estimatedTime !== undefined) {
    task.estimatedTime = estimatedTime;
  }

  await task.save();
  await task.populate("assignedTo createdBy", "name email avatar");

  // Log activity for each change
  for (const change of changes) {
    await ActivityLog.logActivity({
      task: task._id,
      user: req.user._id,
      action: `${change.field}_changed`,
      description: `Changed ${change.field} from "${change.oldValue}" to "${change.newValue}"`,
      changes: change,
    });
  }

  sendSuccess(res, STATUS_CODES.OK, MESSAGES.TASK_UPDATED, { task });
});

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  // Check if user is creator or admin
  if (
    task.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AuthorizationError("You can only delete tasks you created");
  }

  await task.deleteOne();

  // Log activity
  await ActivityLog.logActivity({
    task: task._id,
    user: req.user._id,
    action: "deleted",
    description: `Deleted task "${task.title}"`,
  });

  sendSuccess(res, STATUS_CODES.OK, MESSAGES.TASK_DELETED);
});

/**
 * @desc    Assign users to task
 * @route   POST /api/tasks/:id/assign
 * @access  Private
 */
export const assignTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;

  validateMongoId(id);
  validateRequired(userIds, "User IDs");

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new ValidationError("User IDs must be a non-empty array");
  }

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  // Validate all users exist
  for (const userId of userIds) {
    validateMongoId(userId);
    const user = await User.findById(userId);
    if (!user) {
      throw new ValidationError(`User with ID ${userId} not found`);
    }

    // Add user if not already assigned
    if (!task.assignedTo.includes(userId)) {
      task.assignedTo.push(userId);

      // Log activity
      await ActivityLog.logActivity({
        task: task._id,
        user: req.user._id,
        action: "assigned",
        description: `Assigned task to ${user.name}`,
        metadata: { assignedUserId: userId },
      });
    }
  }

  await task.save();
  await task.populate("assignedTo createdBy", "name email avatar");

  sendSuccess(res, STATUS_CODES.OK, "Users assigned to task successfully", {
    task,
  });
});

/**
 * @desc    Unassign users from task
 * @route   POST /api/tasks/:id/unassign
 * @access  Private
 */
export const unassignTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;

  validateMongoId(id);
  validateRequired(userIds, "User IDs");

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  for (const userId of userIds) {
    const user = await User.findById(userId);
    task.assignedTo = task.assignedTo.filter((id) => id.toString() !== userId);

    // Log activity
    await ActivityLog.logActivity({
      task: task._id,
      user: req.user._id,
      action: "unassigned",
      description: `Unassigned task from ${user?.name || "user"}`,
      metadata: { unassignedUserId: userId },
    });
  }

  await task.save();
  await task.populate("assignedTo createdBy", "name email avatar");

  sendSuccess(res, STATUS_CODES.OK, "Users unassigned from task successfully", {
    task,
  });
});

/**
 * @desc    Add subtask to task
 * @route   POST /api/tasks/:id/subtasks
 * @access  Private
 */
export const addSubtask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  validateMongoId(id);
  validateRequired(title, "Subtask title");

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  await task.addSubtask(title);
  await task.populate("assignedTo createdBy", "name email avatar");

  // Log activity
  await ActivityLog.logActivity({
    task: task._id,
    user: req.user._id,
    action: "subtask_added",
    description: `Added subtask "${title}"`,
  });

  sendSuccess(res, STATUS_CODES.CREATED, "Subtask added successfully", { task });
});

/**
 * @desc    Toggle subtask completion
 * @route   PATCH /api/tasks/:id/subtasks/:subtaskId
 * @access  Private
 */
export const toggleSubtask = asyncHandler(async (req, res) => {
  const { id, subtaskId } = req.params;

  validateMongoId(id);

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  await task.toggleSubtask(subtaskId, req.user._id);
  await task.populate("assignedTo createdBy", "name email avatar");
  await task.populate("subtasks.completedBy", "name email");

  const subtask = task.subtasks.id(subtaskId);

  // Log activity
  await ActivityLog.logActivity({
    task: task._id,
    user: req.user._id,
    action: subtask.completed ? "subtask_completed" : "subtask_uncompleted",
    description: `${subtask.completed ? "Completed" : "Uncompleted"} subtask "${subtask.title}"`,
  });

  sendSuccess(res, STATUS_CODES.OK, "Subtask toggled successfully", { task });
});

/**
 * @desc    Add comment to task
 * @route   POST /api/tasks/:id/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  validateMongoId(id);
  validateRequired(text, "Comment text");
  validateStringLength(text, "Comment", 1, 1000);

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  await task.addComment(text, req.user._id);
  await task.populate("comments.author", "name email avatar");

  // Log activity
  await ActivityLog.logActivity({
    task: task._id,
    user: req.user._id,
    action: "comment_added",
    description: `Added a comment`,
  });

  sendSuccess(res, STATUS_CODES.CREATED, "Comment added successfully", { task });
});

/**
 * @desc    Start time tracking
 * @route   POST /api/tasks/:id/time/start
 * @access  Private
 */
export const startTimeTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  validateMongoId(id);

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  await task.startTimeTracking(req.user._id, description);

  // Log activity
  await ActivityLog.logActivity({
    task: task._id,
    user: req.user._id,
    action: "time_tracking_started",
    description: `Started time tracking`,
  });

  sendSuccess(res, STATUS_CODES.OK, "Time tracking started", { task });
});

/**
 * @desc    Stop time tracking
 * @route   POST /api/tasks/:id/time/stop
 * @access  Private
 */
export const stopTimeTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoId(id);

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  await task.stopTimeTracking(req.user._id);
  await task.populate("timeLogs.user", "name email avatar");

  // Log activity
  await ActivityLog.logActivity({
    task: task._id,
    user: req.user._id,
    action: "time_tracking_stopped",
    description: `Stopped time tracking`,
  });

  sendSuccess(res, STATUS_CODES.OK, "Time tracking stopped", { task });
});

/**
 * @desc    Get task statistics
 * @route   GET /api/tasks/stats
 * @access  Private
 */
export const getTaskStatistics = asyncHandler(async (req, res) => {
  const stats = await Task.getStatistics();

  sendSuccess(res, STATUS_CODES.OK, "Statistics fetched successfully", { stats });
});

/**
 * @desc    Get user's tasks
 * @route   GET /api/tasks/my-tasks
 * @access  Private
 */
export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.getUserTasks(req.user._id);

  sendSuccess(res, STATUS_CODES.OK, "Your tasks fetched successfully", {
    tasks,
    count: tasks.length,
  });
});

/**
 * @desc    Archive/Unarchive task
 * @route   PATCH /api/tasks/:id/archive
 * @access  Private
 */
export const toggleArchive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(MESSAGES.TASK_NOT_FOUND);
  }

  if (task.isArchived) {
    await task.unarchive();
  } else {
    await task.archive();
  }

  // Log activity
  await ActivityLog.logActivity({
    task: task._id,
    user: req.user._id,
    action: task.isArchived ? "archived" : "unarchived",
    description: `${task.isArchived ? "Archived" : "Unarchived"} task`,
  });

  sendSuccess(
    res,
    STATUS_CODES.OK,
    `Task ${task.isArchived ? "archived" : "unarchived"} successfully`,
    { task }
  );
});

/**
 * @desc    Upload attachments to a task
 * @route   POST /api/tasks/:id/attachments
 * @access  Private
 */
export const uploadAttachments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id, "Task ID");

  // Check if files were uploaded
  if (!req.files || req.files.length === 0) {
    throw new ValidationError("No files uploaded");
  }

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError("Task not found");
  }

  // Check permission: only task creator or admin can upload attachments
  if (
    task.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AuthorizationError(
      "You are not authorized to upload attachments to this task"
    );
  }

  // Process uploaded files - they are already uploaded by cloudinary middleware
  const newAttachments = req.files.map((file) => ({
    fileName: file.originalname,
    fileUrl: file.path, // Cloudinary URL
    fileType: file.mimetype,
    fileSize: file.size,
    uploadedBy: req.user._id,
  }));

  // Add attachments to task
  task.attachments.push(...newAttachments);
  await task.save();

  // Log activity
  await ActivityLog.logActivity(
    task._id,
    req.user._id,
    "attachment_added",
    `${req.files.length} attachment(s) added`,
    { attachmentCount: req.files.length }
  );

  sendSuccess(
    res,
    STATUS_CODES.CREATED,
    `${req.files.length} attachment(s) uploaded successfully`,
    { attachments: newAttachments }
  );
});

/**
 * @desc    Delete an attachment from a task
 * @route   DELETE /api/tasks/:id/attachments/:attachmentId
 * @access  Private
 */
export const deleteAttachment = asyncHandler(async (req, res) => {
  const { id, attachmentId } = req.params;
  validateMongoId(id, "Task ID");
  validateMongoId(attachmentId, "Attachment ID");

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError("Task not found");
  }

  const attachment = task.attachments.id(attachmentId);
  if (!attachment) {
    throw new NotFoundError("Attachment not found");
  }

  // Check permission: only uploader, task creator, or admin can delete
  if (
    attachment.uploadedBy.toString() !== req.user._id.toString() &&
    task.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AuthorizationError(
      "You are not authorized to delete this attachment"
    );
  }

  const fileName = attachment.fileName;

  // Delete from Cloudinary
  const cloudinaryService = await import("../services/cloudinaryService.js");
  try {
    // Extract public_id from Cloudinary URL
    const urlParts = attachment.fileUrl.split("/");
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExt.split(".")[0];
    await cloudinaryService.deleteFromCloudinary(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    // Continue with DB deletion even if Cloudinary deletion fails
  }

  // Remove attachment from task
  attachment.deleteOne();
  await task.save();

  // Log activity
  await ActivityLog.logActivity(
    task._id,
    req.user._id,
    "attachment_removed",
    `Attachment "${fileName}" removed`,
    { fileName }
  );

  sendSuccess(
    res,
    STATUS_CODES.OK,
    "Attachment deleted successfully",
    null
  );
});

/**
 * @desc    Edit a comment on a task
 * @route   PATCH /api/tasks/:id/comments/:commentId
 * @access  Private
 */
export const editComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const { text } = req.body;

  validateMongoId(id, "Task ID");
  validateMongoId(commentId, "Comment ID");
  validateRequired(text, "Comment text");
  validateStringLength(text, 1, 1000, "Comment");

  const task = await Task.findById(id).populate("comments.user", "name email");
  if (!task) {
    throw new NotFoundError("Task not found");
  }

  const comment = task.comments.id(commentId);
  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  // Check permission: only comment author or admin can edit
  if (
    comment.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AuthorizationError(
      "You are not authorized to edit this comment"
    );
  }

  const oldText = comment.text;
  comment.text = text;
  await task.save();

  // Log activity
  await ActivityLog.logActivity(
    task._id,
    req.user._id,
    "comment_updated",
    "Comment edited",
    { oldText, newText: text }
  );

  sendSuccess(
    res,
    STATUS_CODES.OK,
    "Comment updated successfully",
    { comment }
  );
});

/**
 * @desc    Delete a comment from a task
 * @route   DELETE /api/tasks/:id/comments/:commentId
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

  validateMongoId(id, "Task ID");
  validateMongoId(commentId, "Comment ID");

  const task = await Task.findById(id).populate("comments.user", "name email");
  if (!task) {
    throw new NotFoundError("Task not found");
  }

  const comment = task.comments.id(commentId);
  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  // Check permission: only comment author, task creator, or admin can delete
  if (
    comment.user._id.toString() !== req.user._id.toString() &&
    task.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AuthorizationError(
      "You are not authorized to delete this comment"
    );
  }

  const commentText = comment.text;
  comment.deleteOne();
  await task.save();

  // Log activity
  await ActivityLog.logActivity(
    task._id,
    req.user._id,
    "comment_removed",
    "Comment deleted",
    { commentText }
  );

  sendSuccess(
    res,
    STATUS_CODES.OK,
    "Comment deleted successfully",
    null
  );
});

/**
 * @desc    Delete a subtask from a task
 * @route   DELETE /api/tasks/:id/subtasks/:subtaskId
 * @access  Private
 */
export const deleteSubtask = asyncHandler(async (req, res) => {
  const { id, subtaskId } = req.params;

  validateMongoId(id, "Task ID");
  validateMongoId(subtaskId, "Subtask ID");

  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError("Task not found");
  }

  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) {
    throw new NotFoundError("Subtask not found");
  }

  // Check permission: only task creator or admin can delete subtasks
  if (
    task.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AuthorizationError(
      "You are not authorized to delete subtasks from this task"
    );
  }

  const subtaskTitle = subtask.title;
  subtask.deleteOne();
  await task.save();

  // Log activity
  await ActivityLog.logActivity(
    task._id,
    req.user._id,
    "subtask_deleted",
    `Subtask "${subtaskTitle}" deleted`,
    { subtaskTitle }
  );

  sendSuccess(
    res,
    STATUS_CODES.OK,
    "Subtask deleted successfully",
    { task }
  );
});
