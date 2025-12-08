import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../controllers/adminTaskController.js";
import { verifyAuth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(verifyAuth, isAdmin);

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:taskId", getTaskById);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);
router.patch("/:taskId/status", updateTaskStatus);

export default router;
