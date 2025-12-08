import mongoose from "mongoose";
import { TASK_STATUS, TASK_PRIORITY } from "../constants/index.js";

// Subtask/Checklist Item Schema
const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Subtask title is required"],
      trim: true,
      maxlength: [200, "Subtask title cannot exceed 200 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Attachment Schema
const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number, // in bytes
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Comment Schema
const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Time Log Schema (for time tracking)
const timeLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Time log description cannot exceed 500 characters"],
  },
});

// Workflow Step Schema (per-user personal workflow)
const workflowStepSchema = new mongoose.Schema({
  stepId: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  done: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { _id: false });

// Assignee Schema (per-user progress and workflow)
const assigneeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  workflow: [workflowStepSchema],
  timeSpentMinutes: {
    type: Number,
    default: 0,
  },
  activeTimerStartedAt: {
    type: Date,
    default: null,
  },
}, { _id: false });

// Main Task Schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Task title must be at least 3 characters"],
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "in-progress", "completed", "archived"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TASK_PRIORITY),
        message: "{VALUE} is not a valid priority",
      },
      default: TASK_PRIORITY.MEDIUM,
    },
    // Per-user assignee system with individual progress and workflows
    assignees: [assigneeSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Tags for categorization
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Attachments
    attachments: [
      {
        url: String,
        name: String,
        type: String,
      },
    ],
    // Dates
    dueDate: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // Subtasks/Checklist (legacy - kept for backward compatibility)
    subtasks: [subtaskSchema],
    // Comments
    comments: [commentSchema],
    // For soft delete
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
taskSchema.index({ title: "text", description: "text" }); // Text search
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ isArchived: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Progress based on completed subtasks
taskSchema.virtual("progress").get(function () {
  if (!this.subtasks || this.subtasks.length === 0) {
    return this.status === TASK_STATUS.COMPLETED ? 100 : 0;
  }
  const completed = this.subtasks.filter((s) => s.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Check if task is overdue
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.status === TASK_STATUS.COMPLETED) {
    return false;
  }
  return new Date() > new Date(this.dueDate);
});

// Days until due
taskSchema.virtual("daysUntilDue").get(function () {
  if (!this.dueDate) return null;
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// ============================================
// INSTANCE METHODS
// ============================================

// Mark task as completed
taskSchema.methods.markAsCompleted = async function () {
  this.status = TASK_STATUS.COMPLETED;
  this.completedAt = new Date();
  await this.save();
  
  // Update user's task completion count
  const User = mongoose.model("User");
  await User.findByIdAndUpdate(this.createdBy, {
    $inc: { tasksCompleted: 1 },
  });
  
  return this;
};

// Add subtask
taskSchema.methods.addSubtask = async function (title) {
  this.subtasks.push({ title, completed: false });
  await this.save();
  return this;
};

// Toggle subtask completion
taskSchema.methods.toggleSubtask = async function (subtaskId, userId) {
  const subtask = this.subtasks.id(subtaskId);
  if (!subtask) {
    throw new Error("Subtask not found");
  }
  
  subtask.completed = !subtask.completed;
  if (subtask.completed) {
    subtask.completedBy = userId;
    subtask.completedAt = new Date();
  } else {
    subtask.completedBy = null;
    subtask.completedAt = null;
  }
  
  await this.save();
  return this;
};

// Add comment
taskSchema.methods.addComment = async function (text, authorId) {
  this.comments.push({
    text,
    author: authorId,
  });
  await this.save();
  return this;
};

// Start time tracking
taskSchema.methods.startTimeTracking = async function (userId, description = "") {
  // Check if user already has an active time log
  const activeLog = this.timeLogs.find(
    (log) => log.user.toString() === userId.toString() && !log.endTime
  );
  
  if (activeLog) {
    throw new Error("Time tracking already active for this user");
  }
  
  this.timeLogs.push({
    user: userId,
    startTime: new Date(),
    description,
  });
  
  await this.save();
  return this;
};

// Stop time tracking
taskSchema.methods.stopTimeTracking = async function (userId) {
  const activeLog = this.timeLogs.find(
    (log) => log.user.toString() === userId.toString() && !log.endTime
  );
  
  if (!activeLog) {
    throw new Error("No active time tracking found for this user");
  }
  
  activeLog.endTime = new Date();
  const duration = Math.round(
    (activeLog.endTime - activeLog.startTime) / (1000 * 60)
  ); // minutes
  activeLog.duration = duration;
  
  // Update total time spent
  this.totalTimeSpent += duration;
  
  await this.save();
  return this;
};

// Archive task
taskSchema.methods.archive = async function () {
  this.isArchived = true;
  this.archivedAt = new Date();
  await this.save();
  return this;
};

// Unarchive task
taskSchema.methods.unarchive = async function () {
  this.isArchived = false;
  this.archivedAt = null;
  await this.save();
  return this;
};

// ============================================
// STATIC METHODS
// ============================================

// Get tasks by status
taskSchema.statics.getTasksByStatus = async function (status) {
  return await this.find({ status, isArchived: false }).populate(
    "assignedTo createdBy",
    "name email avatar"
  );
};

// Get overdue tasks
taskSchema.statics.getOverdueTasks = async function () {
  return await this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: TASK_STATUS.COMPLETED },
    isArchived: false,
  }).populate("assignedTo createdBy", "name email avatar");
};

// Get user tasks
taskSchema.statics.getUserTasks = async function (userId) {
  return await this.find({
    assignedTo: userId,
    isArchived: false,
  })
    .populate("assignedTo createdBy", "name email avatar")
    .sort({ createdAt: -1 });
};

// Get task statistics
taskSchema.statics.getStatistics = async function () {
  const total = await this.countDocuments({ isArchived: false });
  const completed = await this.countDocuments({
    status: TASK_STATUS.COMPLETED,
    isArchived: false,
  });
  const pending = await this.countDocuments({
    status: TASK_STATUS.PENDING,
    isArchived: false,
  });
  const inProgress = await this.countDocuments({
    status: TASK_STATUS.IN_PROGRESS,
    isArchived: false,
  });
  const overdue = await this.countDocuments({
    dueDate: { $lt: new Date() },
    status: { $ne: TASK_STATUS.COMPLETED },
    isArchived: false,
  });
  
  return {
    total,
    completed,
    pending,
    inProgress,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

// ============================================
// MIDDLEWARE
// ============================================

// Pre-save: Update user's task created count
taskSchema.pre("save", async function () {
  if (this.isNew) {
    const User = mongoose.model("User");
    await User.findByIdAndUpdate(this.createdBy, {
      $inc: { tasksCreated: 1 },
    });
  }
});

// Pre-save: Auto-complete if all subtasks done
taskSchema.pre("save", function () {
  if (
    this.subtasks &&
    this.subtasks.length > 0 &&
    this.subtasks.every((s) => s.completed) &&
    this.status !== TASK_STATUS.COMPLETED
  ) {
    // Don't auto-complete, but this logic can be enabled if needed
    // this.status = TASK_STATUS.COMPLETED;
    // this.completedAt = new Date();
  }
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
