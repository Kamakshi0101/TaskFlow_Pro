// Node.js Routes for Report Generation
// These routes are called by the frontend and then call the Java microservice

import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { verifyAuth, isAdmin } from '../middleware/auth.js';
import {
  transformTasksForReport,
  transformUserSummaryForReport,
  generatePdfReport,
  generateExcelReport,
  generateUserSummaryPdf,
  checkJavaServiceHealth
} from '../services/reportIntegrationService.js';

const router = express.Router();

/**
 * GET /api/reports/health
 * Check if Java report service is available
 */
router.get('/health', verifyAuth, isAdmin, async (req, res) => {
  try {
    const isHealthy = await checkJavaServiceHealth();
    
    if (isHealthy) {
      res.json({ 
        status: 'healthy', 
        message: 'Java report service is running',
        serviceUrl: process.env.JAVA_REPORT_SERVICE_URL || 'http://localhost:8085'
      });
    } else {
      res.status(503).json({ 
        status: 'unavailable', 
        message: 'Java report service is not responding' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

/**
 * GET /api/reports/tasks/pdf
 * Generate PDF report of all tasks (with optional filters)
 * Query params: priority, status, dateFrom, dateTo
 */
router.get('/tasks/pdf', verifyAuth, isAdmin, async (req, res) => {
  try {
    console.log('Generating task PDF report...');
    
    // Build query based on filters
    const query = {};
    const filters = {};
    
    if (req.query.priority) {
      const priorities = req.query.priority.split(',');
      query.priority = { $in: priorities };
      filters.priority = priorities;
    }
    
    if (req.query.status) {
      const statuses = req.query.status.split(',');
      query.status = { $in: statuses };
      filters.status = statuses;
    }
    
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) {
        query.createdAt.$gte = new Date(req.query.dateFrom);
        filters.dateFrom = req.query.dateFrom;
      }
      if (req.query.dateTo) {
        query.createdAt.$lte = new Date(req.query.dateTo);
        filters.dateTo = req.query.dateTo;
      }
    }
    
    // Fetch tasks from MongoDB
    const tasks = await Task.find(query)
      .populate('assignees.user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${tasks.length} tasks for report`);
    
    // Transform data for Java service
    const reportData = transformTasksForReport(
      tasks, 
      Object.keys(filters).length > 0 ? filters : null,
      req.user.name
    );
    
    // Call Java service to generate PDF
    const pdfBuffer = await generatePdfReport(reportData);
    
    // Send PDF to frontend
    const filename = `tasks-report-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
    
    console.log('Task PDF report sent successfully');
    
  } catch (error) {
    console.error('Error generating task PDF report:', error);
    res.status(500).json({ 
      message: 'Failed to generate PDF report', 
      error: error.message 
    });
  }
});

/**
 * GET /api/reports/tasks/excel
 * Generate Excel report of all tasks (with optional filters)
 * Query params: priority, status, dateFrom, dateTo
 */
router.get('/tasks/excel', verifyAuth, isAdmin, async (req, res) => {
  try {
    console.log('Generating task Excel report...');
    
    // Build query (same as PDF endpoint)
    const query = {};
    const filters = {};
    
    if (req.query.priority) {
      const priorities = req.query.priority.split(',');
      query.priority = { $in: priorities };
      filters.priority = priorities;
    }
    
    if (req.query.status) {
      const statuses = req.query.status.split(',');
      query.status = { $in: statuses };
      filters.status = statuses;
    }
    
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) {
        query.createdAt.$gte = new Date(req.query.dateFrom);
        filters.dateFrom = req.query.dateFrom;
      }
      if (req.query.dateTo) {
        query.createdAt.$lte = new Date(req.query.dateTo);
        filters.dateTo = req.query.dateTo;
      }
    }
    
    // Fetch tasks from MongoDB
    const tasks = await Task.find(query)
      .populate('assignees.user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${tasks.length} tasks for report`);
    
    // Transform data for Java service
    const reportData = transformTasksForReport(
      tasks,
      Object.keys(filters).length > 0 ? filters : null,
      req.user.name
    );
    
    // Call Java service to generate Excel
    const excelBuffer = await generateExcelReport(reportData);
    
    // Send Excel to frontend
    const filename = `tasks-report-${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    res.send(excelBuffer);
    
    console.log('Task Excel report sent successfully');
    
  } catch (error) {
    console.error('Error generating task Excel report:', error);
    res.status(500).json({ 
      message: 'Failed to generate Excel report', 
      error: error.message 
    });
  }
});

/**
 * GET /api/reports/user-summary/:userId/pdf
 * Generate user productivity summary PDF
 */
router.get('/user-summary/:userId/pdf', verifyAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Only admin or the user themselves can generate their summary
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    console.log(`Generating user summary PDF for user ${userId}...`);
    
    // Fetch user
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch all tasks where user is an assignee
    const tasks = await Task.find({ 'assignees.user': userId })
      .populate('assignees.user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate stats
    let assigned = 0;
    let completed = 0;
    let pending = 0;
    let inProgress = 0;
    
    tasks.forEach(task => {
      const userAssignment = task.assignees.find(
        a => a.user._id.toString() === userId
      );
      
      if (userAssignment) {
        assigned++;
        
        switch (userAssignment.status) {
          case 'completed':
            completed++;
            break;
          case 'pending':
            pending++;
            break;
          case 'in-progress':
            inProgress++;
            break;
        }
      }
    });
    
    const stats = { assigned, completed, pending, inProgress };
    
    // Get recent tasks (limit to 10)
    const recentTasks = tasks.slice(0, 10);
    
    // Transform data for Java service
    const summaryData = transformUserSummaryForReport(user, stats, recentTasks);
    
    // Call Java service to generate PDF
    const pdfBuffer = await generateUserSummaryPdf(summaryData);
    
    // Send PDF to frontend
    const filename = `user-summary-${user.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
    
    console.log('User summary PDF sent successfully');
    
  } catch (error) {
    console.error('Error generating user summary PDF:', error);
    res.status(500).json({ 
      message: 'Failed to generate user summary PDF', 
      error: error.message 
    });
  }
});

export default router;
