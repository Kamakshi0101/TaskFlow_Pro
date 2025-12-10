import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from '../models/Task.js';

// Load environment variables
dotenv.config();

const migrateTaskTimestamps = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all tasks
    const tasks = await Task.find({});
    console.log(`\nFound ${tasks.length} tasks to process...`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const task of tasks) {
      let taskModified = false;

      for (const assignee of task.assignees) {
        // If assignee has completed status but no completedAt, set it to task's createdAt + 1 day
        if (assignee.status === 'completed' && !assignee.completedAt) {
          assignee.completedAt = new Date(task.createdAt.getTime() + 24 * 60 * 60 * 1000);
          taskModified = true;
        }

        // If assignee has in-progress or completed status but no startedAt, set it to task's createdAt
        if ((assignee.status === 'in-progress' || assignee.status === 'completed') && !assignee.startedAt) {
          assignee.startedAt = task.createdAt;
          taskModified = true;
        }

        // If assignee has completedAt but no startedAt, set startedAt to task's createdAt
        if (assignee.completedAt && !assignee.startedAt) {
          assignee.startedAt = task.createdAt;
          taskModified = true;
        }
      }

      if (taskModified) {
        await task.save();
        updatedCount++;
        console.log(`✓ Updated task: ${task.title}`);
      } else {
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migration completed!`);
    console.log(`   Updated: ${updatedCount} tasks`);
    console.log(`   Skipped: ${skippedCount} tasks (already had timestamps)`);
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateTaskTimestamps();
