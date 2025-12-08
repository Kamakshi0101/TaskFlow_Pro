import express from "express";
import {
  getMyTasks,
  getMyTaskById,
  updateMyTaskStatus,
  updateMyWorkflow,
  updateTimer,
} from "../controllers/myTasksController.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(verifyAuth);

router.get("/", getMyTasks);
router.get("/:taskId", getMyTaskById);
router.patch("/:taskId/status", updateMyTaskStatus);
router.patch("/:taskId/workflow", updateMyWorkflow);
router.patch("/:taskId/timer", updateTimer);

export default router;
