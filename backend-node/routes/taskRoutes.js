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
  addComment,
  startTimeTracking,
  stopTimeTracking,
  getTaskStatistics,
  getMyTasks,
  toggleArchive,
} from "../controllers/taskController.js";
import { verifyAuth, isAdmin } from "../middleware/auth.js";

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

// ============================================
// COMMENTS
// ============================================

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add comment to task
 * @access  Private
 */
router.post("/:id/comments", addComment);

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

export default router;
