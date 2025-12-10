import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from '../models/Task.js';
import { differenceInHours } from 'date-fns';

// Load environment variables
dotenv.config();

const checkTaskData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all tasks
    const tasks = await Task.find({ isArchived: false });
    console.log(`Found ${tasks.length} tasks\n`);

    let completedTasks = 0;
    let totalCompletionTime = 0;
    let completedCount = 0;

    tasks.forEach((task) => {
      console.log(`\nTask: ${task.title}`);
      console.log(`Created At: ${task.createdAt}`);
      
      task.assignees.forEach((assignee, idx) => {
        console.log(`  Assignee ${idx + 1}:`);
        console.log(`    Status: ${assignee.status}`);
        console.log(`    StartedAt: ${assignee.startedAt || 'NULL'}`);
        console.log(`    CompletedAt: ${assignee.completedAt || 'NULL'}`);
        
        if (assignee.status === 'completed') {
          completedTasks++;
          if (assignee.completedAt) {
            const startTime = assignee.startedAt || task.createdAt;
            const timeInHours = differenceInHours(new Date(assignee.completedAt), new Date(startTime));
            const timeInDays = timeInHours / 24;
            console.log(`    Time taken: ${timeInHours} hours (${timeInDays.toFixed(2)} days)`);
            totalCompletionTime += Math.max(timeInDays, 0);
            completedCount++;
          }
        }
      });
    });

    const avgCompletionTime = completedCount > 0 ? (totalCompletionTime / completedCount) : 0;

    console.log('\n' + '='.repeat(60));
    console.log(`Summary:`);
    console.log(`  Total Completed Tasks: ${completedTasks}`);
    console.log(`  Tasks with completion time: ${completedCount}`);
    console.log(`  Total Completion Time: ${totalCompletionTime.toFixed(2)} days`);
    console.log(`  Average Completion Time: ${avgCompletionTime.toFixed(2)} days`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run check
checkTaskData();
