import mongoose from "mongoose";

// Activity/Audit Log Schema for tracking all task-related actions
const activityLogSchema = new mongoose.Schema(
  {
    // Reference to the task
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    // User who performed the action
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Type of action performed
    action: {
      type: String,
      required: true,
      enum: [
        // Task lifecycle
        "created",
        "updated",
        "deleted",
        "archived",
        "unarchived",
        
        // Status changes
        "status_changed",
        "priority_changed",
        
        // Assignment
        "assigned",
        "unassigned",
        
        // Subtasks
        "subtask_added",
        "subtask_completed",
        "subtask_uncompleted",
        "subtask_deleted",
        
        // Comments
        "comment_added",
        "comment_edited",
        "comment_deleted",
        
        // Attachments
        "attachment_added",
        "attachment_deleted",
        
        // Time tracking
        "time_tracking_started",
        "time_tracking_stopped",
        
        // Dates
        "due_date_changed",
        "start_date_changed",
        
        // Other
        "description_changed",
        "title_changed",
        "tags_changed",
      ],
    },
    // Detailed description of the action
    description: {
      type: String,
      required: true,
      maxlength: [500, "Activity description cannot exceed 500 characters"],
    },
    // Previous and new values (for tracking changes)
    changes: {
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
    },
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // IP address (optional, for security auditing)
    ipAddress: {
      type: String,
    },
    // User agent (optional)
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// ============================================
// INDEXES
// ============================================
activityLogSchema.index({ task: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

// ============================================
// STATIC METHODS
// ============================================

/**
 * Log an activity
 */
activityLogSchema.statics.logActivity = async function ({
  task,
  user,
  action,
  description,
  changes = null,
  metadata = {},
  ipAddress = null,
  userAgent = null,
}) {
  return await this.create({
    task,
    user,
    action,
    description,
    changes,
    metadata,
    ipAddress,
    userAgent,
  });
};

/**
 * Get activities for a specific task
 */
activityLogSchema.statics.getTaskActivities = async function (
  taskId,
  limit = 50
) {
  return await this.find({ task: taskId })
    .populate("user", "name email avatar")
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Get user's recent activities
 */
activityLogSchema.statics.getUserActivities = async function (
  userId,
  limit = 50
) {
  return await this.find({ user: userId })
    .populate("task", "title status priority")
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Get recent activities across all tasks (for dashboard)
 */
activityLogSchema.statics.getRecentActivities = async function (limit = 100) {
  return await this.find()
    .populate("user", "name email avatar")
    .populate("task", "title status priority")
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Get activity statistics
 */
activityLogSchema.statics.getStatistics = async function (startDate, endDate) {
  const match = {};
  if (startDate) match.createdAt = { $gte: new Date(startDate) };
  if (endDate) match.createdAt = { ...match.createdAt, $lte: new Date(endDate) };

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return stats;
};

/**
 * Delete old activities (for cleanup/maintenance)
 */
activityLogSchema.statics.deleteOldActivities = async function (daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
  });

  return result;
};

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Format activity for display
 */
activityLogSchema.methods.formatForDisplay = function () {
  return {
    id: this._id,
    action: this.action,
    description: this.description,
    user: this.user,
    task: this.task,
    changes: this.changes,
    timestamp: this.createdAt,
    timeAgo: this.getTimeAgo(),
  };
};

/**
 * Get human-readable time ago
 */
activityLogSchema.methods.getTimeAgo = function () {
  const seconds = Math.floor((new Date() - this.createdAt) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }
  
  return "just now";
};

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
