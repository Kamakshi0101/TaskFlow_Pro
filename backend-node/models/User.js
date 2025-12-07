import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/index.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: "{VALUE} is not a valid role",
      },
      default: ROLES.USER,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    avatar: {
      type: String, // URL to avatar image (Cloudinary)
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // For activity tracking
    tasksCreated: {
      type: Number,
      default: 0,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    // Password reset (for future implementation)
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

// Hash password before saving
userSchema.pre("save", async function () {
  // Only hash if password is modified or new
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ============================================
// INSTANCE METHODS
// ============================================

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Get user without sensitive data
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.__v;
  return user;
};

// Update last login timestamp
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

// ============================================
// STATIC METHODS
// ============================================

// Find user by email with password (for login)
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email, isActive: true }).select("+password");
  
  if (!user) {
    return null;
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return null;
  }

  return user;
};

// Get active users count
userSchema.statics.getActiveUsersCount = async function () {
  return await this.countDocuments({ isActive: true });
};

// Get users by role
userSchema.statics.getUsersByRole = async function (role) {
  return await this.find({ role, isActive: true });
};

// ============================================
// VIRTUAL FIELDS
// ============================================

// Full profile completeness (for gamification/UI)
userSchema.virtual("profileCompleteness").get(function () {
  let completeness = 40; // Base for having email and password
  if (this.name) completeness += 20;
  if (this.title) completeness += 20;
  if (this.avatar) completeness += 20;
  return completeness;
});

const User = mongoose.model("User", userSchema);

export default User;
