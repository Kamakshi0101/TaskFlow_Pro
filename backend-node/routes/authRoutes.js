import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
} from "../controllers/authController.js";
import { verifyAuth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", verifyAuth, logout);
router.get("/me", verifyAuth, getMe);
router.patch("/update-profile", verifyAuth, updateProfile);
router.patch("/change-password", verifyAuth, changePassword);

// Admin routes
router.get("/users", verifyAuth, isAdmin, getAllUsers);

export default router;
