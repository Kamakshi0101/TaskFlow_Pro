import express from "express";
import {
  getMyTasks,
  getMyTaskById,
  updateMyTaskStatus,
  updateTimer,
} from "../controllers/myTasksController.js";
import {
  getWorkflow,
  addWorkflowStep,
  toggleWorkflowStep,
  reorderWorkflowSteps,
  deleteWorkflowStep,
} from "../controllers/workflowController.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(verifyAuth);

// Task routes
router.get("/", getMyTasks);
router.get("/:taskId", getMyTaskById);
router.patch("/:taskId/status", updateMyTaskStatus);
router.patch("/:taskId/timer", updateTimer);

// Workflow routes
router.get("/:taskId/workflow", getWorkflow);
router.post("/:taskId/workflow/add-step", addWorkflowStep);
router.patch("/:taskId/workflow/toggle-step", toggleWorkflowStep);
router.patch("/:taskId/workflow/reorder", reorderWorkflowSteps);
router.delete("/:taskId/workflow/step/:stepId", deleteWorkflowStep);

export default router;
