import User from "../models/User.js";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from "../utils/errorHandler.js";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateStringLength,
} from "../utils/validators.js";
import { generateToken } from "../utils/jwt.js";
import { sendSuccess } from "../utils/response.js";
import { STATUS_CODES, MESSAGES, ROLES, COOKIE_OPTIONS } from "../constants/index.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, inviteCode } = req.body;

  // Validation
  validateRequired(name, "Name");
  validateRequired(email, "Email");
  validateRequired(password, "Password");
  validateEmail(email);
  validatePassword(password);
  validateStringLength(name, "Name", 2, 50);

  // Check if admin registration requires invite code
  if (role === ROLES.ADMIN) {
    if (!inviteCode || inviteCode !== process.env.ADMIN_INVITE_CODE) {
      throw new ValidationError("Invalid admin invite code");
    }
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role === ROLES.ADMIN && inviteCode === process.env.ADMIN_INVITE_CODE 
      ? ROLES.ADMIN 
      : ROLES.USER,
  });

  // Generate token
  const token = generateToken(user._id, user.role);

  // Set cookie
  res.cookie("token", token, COOKIE_OPTIONS);

  // Update last login
  await user.updateLastLogin();

  // Send response (without password)
  sendSuccess(res, STATUS_CODES.CREATED, MESSAGES.USER_REGISTERED, {
    user: user.toSafeObject(),
    token,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  validateRequired(email, "Email");
  validateRequired(password, "Password");
  validateEmail(email);

  // Find user with password
  const user = await User.findByCredentials(email, password);

  if (!user) {
    throw new AuthenticationError(MESSAGES.INVALID_CREDENTIALS);
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  // Set cookie
  res.cookie("token", token, COOKIE_OPTIONS);

  // Update last login
  await user.updateLastLogin();

  // Send response
  sendSuccess(res, STATUS_CODES.OK, MESSAGES.LOGIN_SUCCESS, {
    user: user.toSafeObject(),
    token,
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendSuccess(res, STATUS_CODES.OK, MESSAGES.LOGOUT_SUCCESS);
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by verifyAuth middleware
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
  }

  sendSuccess(res, STATUS_CODES.OK, "User profile fetched successfully", {
    user: user.toSafeObject(),
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, title, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
  }

  // Update fields if provided
  if (name) {
    validateStringLength(name, "Name", 2, 50);
    user.name = name;
  }
  if (title !== undefined) {
    if (title && title.length > 0) {
      validateStringLength(title, "Title", 1, 100);
    }
    user.title = title;
  }
  if (avatar !== undefined) {
    user.avatar = avatar;
  }

  await user.save();

  sendSuccess(res, STATUS_CODES.OK, "Profile updated successfully", {
    user: user.toSafeObject(),
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  validateRequired(currentPassword, "Current password");
  validateRequired(newPassword, "New password");
  validatePassword(newPassword);

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
  }

  // Check current password
  const isPasswordMatch = await user.comparePassword(currentPassword);
  if (!isPasswordMatch) {
    throw new AuthenticationError("Current password is incorrect");
  }

  // Check if new password is same as current
  if (currentPassword === newPassword) {
    throw new ValidationError("New password must be different from current password");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id, user.role);

  // Set new cookie
  res.cookie("token", token, COOKIE_OPTIONS);

  sendSuccess(res, STATUS_CODES.OK, "Password changed successfully", {
    token,
  });
});

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search } = req.query;

  // Build query
  const query = {};

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 });

  sendSuccess(res, STATUS_CODES.OK, "Users fetched successfully", {
    users: users.map((user) => user.toSafeObject()),
    count: users.length,
  });
});

/**
 * @desc    Toggle user active status (admin only)
 * @route   PATCH /api/auth/users/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ValidationError("You cannot deactivate your own account");
  }

  user.isActive = !user.isActive;
  await user.save();

  sendSuccess(
    res,
    STATUS_CODES.OK,
    `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    {
      user: user.toSafeObject(),
    }
  );
});

/**
 * @desc    Delete user (admin only)
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ValidationError("You cannot delete your own account");
  }

  await user.deleteOne();

  sendSuccess(res, STATUS_CODES.OK, "User deleted successfully");
});
