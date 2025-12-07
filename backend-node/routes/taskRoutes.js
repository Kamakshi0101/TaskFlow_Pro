import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  addComment,
  editComment,
  deleteComment,
  startTimeTracking,
  stopTimeTracking,
  getTaskStatistics,
  getMyTasks,
  toggleArchive,
  uploadAttachments,
  deleteAttachment,
} from "../controllers/taskController.js";
import { verifyAuth, isAdmin } from "../middleware/auth.js";
import { uploadMultiple } from "../middleware/upload.js";

const router = express.Router();

// All task routes require authentication
router.use(verifyAuth);

// ============================================
// TASK CRUD OPERATIONS
// ============================================

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Private
 */
router.post("/", createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filtering & pagination
 * @access  Private
 */
router.get("/", getAllTasks);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics
 * @access  Private
 */
router.get("/stats", getTaskStatistics);

/**
 * @route   GET /api/tasks/my-tasks
 * @desc    Get current user's tasks
 * @access  Private
 */
router.get("/my-tasks", getMyTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
router.get("/:id", getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.put("/:id", updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
router.delete("/:id", deleteTask);

// ============================================
// TASK ASSIGNMENT
// ============================================

/**
 * @route   POST /api/tasks/:id/assign
 * @desc    Assign users to task
 * @access  Private
 */
router.post("/:id/assign", assignTask);

/**
 * @route   POST /api/tasks/:id/unassign
 * @desc    Unassign users from task
 * @access  Private
 */
router.post("/:id/unassign", unassignTask);

// ============================================
// SUBTASKS
// ============================================

/**
 * @route   POST /api/tasks/:id/subtasks
 * @desc    Add subtask to task
 * @access  Private
 */
router.post("/:id/subtasks", addSubtask);

/**
 * @route   PATCH /api/tasks/:id/subtasks/:subtaskId
 * @desc    Toggle subtask completion
 * @access  Private
 */
router.patch("/:id/subtasks/:subtaskId", toggleSubtask);

/**
 * @route   DELETE /api/tasks/:id/subtasks/:subtaskId
 * @desc    Delete subtask from task
 * @access  Private
 */
router.delete("/:id/subtasks/:subtaskId", deleteSubtask);

// ============================================
// COMMENTS
// ============================================

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add comment to task
 * @access  Private
 */
router.post("/:id/comments", addComment);

/**
 * @route   PATCH /api/tasks/:id/comments/:commentId
 * @desc    Edit comment on task
 * @access  Private
 */
router.patch("/:id/comments/:commentId", editComment);

/**
 * @route   DELETE /api/tasks/:id/comments/:commentId
 * @desc    Delete comment from task
 * @access  Private
 */
router.delete("/:id/comments/:commentId", deleteComment);

// ============================================
// TIME TRACKING
// ============================================

/**
 * @route   POST /api/tasks/:id/time/start
 * @desc    Start time tracking for task
 * @access  Private
 */
router.post("/:id/time/start", startTimeTracking);

/**
 * @route   POST /api/tasks/:id/time/stop
 * @desc    Stop time tracking for task
 * @access  Private
 */
router.post("/:id/time/stop", stopTimeTracking);

// ============================================
// ARCHIVE
// ============================================

/**
 * @route   PATCH /api/tasks/:id/archive
 * @desc    Archive/Unarchive task
 * @access  Private
 */
router.patch("/:id/archive", toggleArchive);

// ============================================
// FILE ATTACHMENTS
// ============================================

/**
 * @route   POST /api/tasks/:id/attachments
 * @desc    Upload attachments to task
 * @access  Private
 */
router.post("/:id/attachments", uploadMultiple, uploadAttachments);

/**
 * @route   DELETE /api/tasks/:id/attachments/:attachmentId
 * @desc    Delete attachment from task
 * @access  Private
 */
router.delete("/:id/attachments/:attachmentId", deleteAttachment);

export default router;
