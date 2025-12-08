import User from "../models/User.js";
import Task from "../models/Task.js";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "../utils/errorHandler.js";
import { sendSuccess } from "../utils/response.js";
import { STATUS_CODES } from "../constants/index.js";

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    search = "",
    role = "all",
    status = "all",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Role filter
  if (role !== "all") {
    query.role = role;
  }

  // Status filter (active/inactive)
  if (status === "active") {
    query.isActive = true;
  } else if (status === "inactive") {
    query.isActive = false;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const users = await User.find(query)
    .select("-password")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const totalUsers = await User.countDocuments(query);

  // For simple list requests (no pagination needed), skip stats
  if (req.query.simple === "true") {
    return sendSuccess(res, STATUS_CODES.OK, "Users retrieved successfully", {
      users,
    });
  }

  // Get task counts for each user
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const taskStats = await Task.aggregate([
        { $match: { "assignees.user": user._id } },
        {
          $project: {
            assigneeData: {
              $filter: {
                input: "$assignees",
                as: "assignee",
                cond: { $eq: ["$$assignee.user", user._id] },
              },
            },
          },
        },
        { $unwind: "$assigneeData" },
        {
          $group: {
            _id: "$assigneeData.status",
            count: { $sum: 1 },
          },
        },
      ]);

      const stats = {
        total: 0,
        pending: 0,
        "in-progress": 0,
        completed: 0,
      };

      taskStats.forEach((stat) => {
        stats[stat._id] = stat.count;
        stats.total += stat.count;
      });

      return {
        ...user,
        taskStats: stats,
      };
    })
  );

  sendSuccess(res, STATUS_CODES.OK, "Users retrieved successfully", {
    users: usersWithStats,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
  });
});

/**
 * @desc    Get user by ID (Admin only)
 * @route   GET /api/users/:userId
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Get detailed task information
  const tasks = await Task.find({ "assignees.user": userId })
    .populate("createdBy", "name email")
    .lean();

  const userTasks = tasks.map((task) => {
    const assigneeData = task.assignees.find(
      (a) => a.user.toString() === userId
    );
    return {
      ...task,
      myStatus: assigneeData?.status,
      myProgress: assigneeData?.progress,
      myWorkflow: assigneeData?.workflow,
      timeSpent: assigneeData?.timeSpentMinutes,
    };
  });

  sendSuccess(res, STATUS_CODES.OK, "User retrieved successfully", {
    user,
    tasks: userTasks,
  });
});

/**
 * @desc    Update user status (Admin only)
 * @route   PATCH /api/users/:userId/status
 * @access  Private/Admin
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ValidationError("isActive must be a boolean");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new NotFoundError("User not found");
  }

  sendSuccess(
    res,
    STATUS_CODES.OK,
    `User ${isActive ? "activated" : "deactivated"} successfully`,
    { user }
  );
});

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/users/:userId/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    throw new ValidationError("Role must be either 'user' or 'admin'");
  }

  // Prevent admins from changing their own role
  if (userId === req.user._id.toString()) {
    throw new AuthorizationError("You cannot change your own role");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new NotFoundError("User not found");
  }

  sendSuccess(res, STATUS_CODES.OK, "User role updated successfully", { user });
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:userId
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Prevent admins from deleting themselves
  if (userId === req.user._id.toString()) {
    throw new AuthorizationError("You cannot delete your own account");
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Remove user from all task assignees
  await Task.updateMany(
    { "assignees.user": userId },
    { $pull: { assignees: { user: userId } } }
  );

  sendSuccess(res, STATUS_CODES.OK, "User deleted successfully", { user });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password").lean();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Get user's task statistics
  const taskStats = await Task.aggregate([
    { $match: { "assignees.user": user._id } },
    {
      $project: {
        assigneeData: {
          $filter: {
            input: "$assignees",
            as: "assignee",
            cond: { $eq: ["$$assignee.user", user._id] },
          },
        },
      },
    },
    { $unwind: "$assigneeData" },
    {
      $group: {
        _id: "$assigneeData.status",
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = {
    total: 0,
    pending: 0,
    "in-progress": 0,
    completed: 0,
  };

  taskStats.forEach((stat) => {
    stats[stat._id] = stat.count;
    stats.total += stat.count;
  });

  sendSuccess(res, STATUS_CODES.OK, "Profile retrieved successfully", {
    user: { ...user, taskStats: stats },
  });
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateCurrentUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new NotFoundError("User not found");
  }

  sendSuccess(res, STATUS_CODES.OK, "Profile updated successfully", { user });
});
