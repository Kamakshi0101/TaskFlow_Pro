// Node.js Integration Layer for Java Report Service
// This file provides functions to call the Java microservice from the Node backend

import axios from 'axios';

// Java service base URL
const JAVA_SERVICE_URL = process.env.JAVA_REPORT_SERVICE_URL || 'http://localhost:8085';

/**
 * Transforms MongoDB task documents to the format expected by Java service
 * @param {Array} tasks - Array of Mongoose task documents
 * @param {Object} filters - Filter criteria used
 * @param {String} generatedBy - Name of user generating report
 * @returns {Object} - Formatted ReportRequest object
 */
function transformTasksForReport(tasks, filters = null, generatedBy = 'Admin') {
  return {
    title: 'TaskFlowPro - Task Report',
    generatedAt: new Date().toISOString(),
    generatedBy: generatedBy,
    filters: filters ? {
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
      priority: filters.priority ? (Array.isArray(filters.priority) ? filters.priority : [filters.priority]) : null,
      status: filters.status ? (Array.isArray(filters.status) ? filters.status : [filters.status]) : null
    } : null,
    tasks: tasks.map(task => ({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      createdAt: task.createdAt ? task.createdAt.toISOString() : null,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      assignees: (task.assignees || []).map(assignee => ({
        name: assignee.user?.name || 'Unknown',
        email: assignee.user?.email || 'unknown@example.com',
        status: assignee.status || 'pending',
        progress: assignee.progress || 0
      }))
    }))
  };
}

/**
 * Transforms user data for user summary report
 * @param {Object} user - User document
 * @param {Object} stats - User statistics
 * @param {Array} recentTasks - Recent tasks for the user
 * @returns {Object} - Formatted UserSummaryReportRequest object
 */
function transformUserSummaryForReport(user, stats, recentTasks) {
  return {
    generatedAt: new Date().toISOString(),
    user: {
      name: user.name,
      email: user.email
    },
    stats: {
      assigned: stats.assigned || 0,
      completed: stats.completed || 0,
      pending: stats.pending || 0,
      inProgress: stats.inProgress || 0
    },
    recentTasks: recentTasks.map(task => ({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      createdAt: task.createdAt ? task.createdAt.toISOString() : null,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      assignees: (task.assignees || []).map(assignee => ({
        name: assignee.user?.name || 'Unknown',
        email: assignee.user?.email || 'unknown@example.com',
        status: assignee.status || 'pending',
        progress: assignee.progress || 0
      }))
    }))
  };
}

/**
 * Calls Java service to generate PDF report
 * @param {Object} reportData - Formatted report request
 * @returns {Promise<Buffer>} - PDF file as buffer
 */
async function generatePdfReport(reportData) {
  try {
    const response = await axios.post(
      `${JAVA_SERVICE_URL}/api/report/tasks/pdf`,
      reportData,
      {
        responseType: 'arraybuffer', // Important: receive binary data
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error calling Java PDF service:', error.message);
    throw new Error('Failed to generate PDF report: ' + error.message);
  }
}

/**
 * Calls Java service to generate Excel report
 * @param {Object} reportData - Formatted report request
 * @returns {Promise<Buffer>} - Excel file as buffer
 */
async function generateExcelReport(reportData) {
  try {
    const response = await axios.post(
      `${JAVA_SERVICE_URL}/api/report/tasks/excel`,
      reportData,
      {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error calling Java Excel service:', error.message);
    throw new Error('Failed to generate Excel report: ' + error.message);
  }
}

/**
 * Calls Java service to generate user summary PDF
 * @param {Object} summaryData - Formatted user summary request
 * @returns {Promise<Buffer>} - PDF file as buffer
 */
async function generateUserSummaryPdf(summaryData) {
  try {
    const response = await axios.post(
      `${JAVA_SERVICE_URL}/api/report/user-summary/pdf`,
      summaryData,
      {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error calling Java user summary service:', error.message);
    throw new Error('Failed to generate user summary PDF: ' + error.message);
  }
}

/**
 * Checks if Java service is available
 * @returns {Promise<Boolean>} - True if service is healthy
 */
async function checkJavaServiceHealth() {
  try {
    const response = await axios.get(
      `${JAVA_SERVICE_URL}/api/report/health`,
      { timeout: 5000 }
    );
    return response.status === 200;
  } catch (error) {
    console.error('Java service health check failed:', error.message);
    return false;
  }
}

export {
  transformTasksForReport,
  transformUserSummaryForReport,
  generatePdfReport,
  generateExcelReport,
  generateUserSummaryPdf,
  checkJavaServiceHealth
};
