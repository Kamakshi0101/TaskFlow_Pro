import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from '../models/Task.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const checkLeaderboardData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({ role: 'user' }).select('name email');
    const tasks = await Task.find({ isArchived: false });

    console.log(`Found ${users.length} users and ${tasks.length} tasks\n`);

    users.forEach((user) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`User: ${user.name} (${user.email})`);
      console.log('='.repeat(60));

      let totalTasks = 0;
      let completedTasks = 0;
      let pendingTasks = 0;
      let inProgressTasks = 0;

      tasks.forEach((task) => {
        const assignee = task.assignees.find((a) => a.user.toString() === user._id.toString());
        if (assignee) {
          totalTasks++;
          console.log(`\n  Task: "${task.title}"`);
          console.log(`    Assignee Status: ${assignee.status}`);
          console.log(`    Started At: ${assignee.startedAt || 'NULL'}`);
          console.log(`    Completed At: ${assignee.completedAt || 'NULL'}`);

          if (assignee.status === 'completed') {
            completedTasks++;
          } else if (assignee.status === 'in-progress') {
            inProgressTasks++;
          } else if (assignee.status === 'pending') {
            pendingTasks++;
          }
        }
      });

      const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      console.log(`\n  Summary:`);
      console.log(`    Total Tasks: ${totalTasks}`);
      console.log(`    Completed: ${completedTasks}`);
      console.log(`    In Progress: ${inProgressTasks}`);
      console.log(`    Pending: ${pendingTasks}`);
      console.log(`    Productivity Score: ${productivity}%`);
    });

    console.log('\n' + '='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkLeaderboardData();
