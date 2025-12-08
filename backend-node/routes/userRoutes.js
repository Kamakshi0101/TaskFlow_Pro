import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
} from "../controllers/userController.js";
import { verifyAuth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public profile routes (authenticated users)
router.get("/profile", verifyAuth, getCurrentUser);
router.put("/profile", verifyAuth, updateCurrentUser);

// Admin-only routes
router.get("/", verifyAuth, isAdmin, getAllUsers);
router.get("/:userId", verifyAuth, isAdmin, getUserById);
router.patch("/:userId/status", verifyAuth, isAdmin, updateUserStatus);
router.patch("/:userId/role", verifyAuth, isAdmin, updateUserRole);
router.delete("/:userId", verifyAuth, isAdmin, deleteUser);

export default router;
