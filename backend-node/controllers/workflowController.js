import { nanoid } from 'nanoid';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { AppError } from '../utils/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { STATUS_CODES } from '../constants/index.js';

/**
 * @desc    Get user's personal workflow for a task
 * @route   GET /api/my-tasks/:taskId/workflow
 * @access  Private
 */
export const getWorkflow = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  const task = await Task.findOne({
    _id: taskId,
    'assignees.user': userId,
  });

  if (!task) {
    throw new AppError('Task not found or you are not assigned to it', STATUS_CODES.NOT_FOUND);
  }

  const assignee = task.assignees.find((a) => a.user.toString() === userId);

  const workflow = assignee.workflow || [];
  const totalSteps = workflow.length;
  const completedSteps = workflow.filter((step) => step.done).length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  sendSuccess(res, STATUS_CODES.OK, 'Workflow retrieved successfully', {
    workflow,
    progress,
    status: assignee.status,
    totalSteps,
    completedSteps,
  });
});

/**
 * @desc    Add a workflow step
 * @route   POST /api/my-tasks/:taskId/workflow/add-step
 * @access  Private
 */
export const addWorkflowStep = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { label } = req.body;
  const userId = req.user.id;

  if (!label || !label.trim()) {
    throw new AppError('Step label is required', STATUS_CODES.BAD_REQUEST);
  }

  const task = await Task.findOne({
    _id: taskId,
    'assignees.user': userId,
  });

  if (!task) {
    throw new AppError('Task not found or you are not assigned to it', STATUS_CODES.NOT_FOUND);
  }

  const assigneeIndex = task.assignees.findIndex((a) => a.user.toString() === userId);
  
  if (assigneeIndex === -1) {
    throw new AppError('You are not assigned to this task', STATUS_CODES.FORBIDDEN);
  }

  // Generate unique stepId
  const stepId = nanoid(8);
  const order = task.assignees[assigneeIndex].workflow.length + 1;

  // Add new step
  task.assignees[assigneeIndex].workflow.push({
    stepId,
    label: label.trim(),
    done: false,
    order,
  });

  // Calculate progress
  const workflow = task.assignees[assigneeIndex].workflow;
  const completedSteps = workflow.filter((step) => step.done).length;
  const totalSteps = workflow.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  task.assignees[assigneeIndex].progress = progress;

  // Set startedAt if this is the first step and it wasn't set
  if (!task.assignees[assigneeIndex].startedAt) {
    task.assignees[assigneeIndex].startedAt = new Date();
    task.assignees[assigneeIndex].status = 'in-progress';
  }

  await task.save();

  sendSuccess(res, STATUS_CODES.CREATED, 'Workflow step added successfully', {
    stepId,
    progress,
    status: task.assignees[assigneeIndex].status,
  });
});

/**
 * @desc    Toggle a workflow step (mark done/undone)
 * @route   PATCH /api/my-tasks/:taskId/workflow/toggle-step
 * @access  Private
 */
export const toggleWorkflowStep = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { stepId } = req.body;
  const userId = req.user.id;

  if (!stepId) {
    throw new AppError('Step ID is required', STATUS_CODES.BAD_REQUEST);
  }

  const task = await Task.findOne({
    _id: taskId,
    'assignees.user': userId,
  });

  if (!task) {
    throw new AppError('Task not found or you are not assigned to it', STATUS_CODES.NOT_FOUND);
  }

  const assigneeIndex = task.assignees.findIndex((a) => a.user.toString() === userId);
  
  if (assigneeIndex === -1) {
    throw new AppError('You are not assigned to this task', STATUS_CODES.FORBIDDEN);
  }

  // Find and toggle the step
  const workflow = task.assignees[assigneeIndex].workflow;
  const step = workflow.find((s) => s.stepId === stepId);

  if (!step) {
    throw new AppError('Workflow step not found', STATUS_CODES.NOT_FOUND);
  }

  step.done = !step.done;

  // Calculate new progress
  const completedSteps = workflow.filter((s) => s.done).length;
  const totalSteps = workflow.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  task.assignees[assigneeIndex].progress = progress;

  // Update status based on progress
  if (progress === 100) {
    task.assignees[assigneeIndex].status = 'completed';
    task.assignees[assigneeIndex].completedAt = new Date();
  } else if (progress > 0 && task.assignees[assigneeIndex].status === 'pending') {
    task.assignees[assigneeIndex].status = 'in-progress';
    if (!task.assignees[assigneeIndex].startedAt) {
      task.assignees[assigneeIndex].startedAt = new Date();
    }
  } else if (progress > 0 && progress < 100) {
    task.assignees[assigneeIndex].status = 'in-progress';
  }

  await task.save();

  sendSuccess(res, STATUS_CODES.OK, 'Workflow step toggled successfully', {
    progress,
    status: task.assignees[assigneeIndex].status,
    completedSteps,
    totalSteps,
  });
});

/**
 * @desc    Reorder workflow steps
 * @route   PATCH /api/my-tasks/:taskId/workflow/reorder
 * @access  Private
 */
export const reorderWorkflowSteps = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { steps } = req.body; // Array of { stepId, order }
  const userId = req.user.id;

  if (!steps || !Array.isArray(steps)) {
    throw new AppError('Steps array is required', STATUS_CODES.BAD_REQUEST);
  }

  const task = await Task.findOne({
    _id: taskId,
    'assignees.user': userId,
  });

  if (!task) {
    throw new AppError('Task not found or you are not assigned to it', STATUS_CODES.NOT_FOUND);
  }

  const assigneeIndex = task.assignees.findIndex((a) => a.user.toString() === userId);
  
  if (assigneeIndex === -1) {
    throw new AppError('You are not assigned to this task', STATUS_CODES.FORBIDDEN);
  }

  // Update order for each step
  const workflow = task.assignees[assigneeIndex].workflow;
  steps.forEach(({ stepId, order }) => {
    const step = workflow.find((s) => s.stepId === stepId);
    if (step) {
      step.order = order;
    }
  });

  // Sort by order
  workflow.sort((a, b) => a.order - b.order);

  await task.save();

  sendSuccess(res, STATUS_CODES.OK, 'Workflow reordered successfully', {
    workflow: task.assignees[assigneeIndex].workflow,
  });
});

/**
 * @desc    Delete a workflow step
 * @route   DELETE /api/my-tasks/:taskId/workflow/step/:stepId
 * @access  Private
 */
export const deleteWorkflowStep = asyncHandler(async (req, res) => {
  const { taskId, stepId } = req.params;
  const userId = req.user.id;

  const task = await Task.findOne({
    _id: taskId,
    'assignees.user': userId,
  });

  if (!task) {
    throw new AppError('Task not found or you are not assigned to it', STATUS_CODES.NOT_FOUND);
  }

  const assigneeIndex = task.assignees.findIndex((a) => a.user.toString() === userId);
  
  if (assigneeIndex === -1) {
    throw new AppError('You are not assigned to this task', STATUS_CODES.FORBIDDEN);
  }

  // Remove the step
  const workflow = task.assignees[assigneeIndex].workflow;
  const initialLength = workflow.length;
  task.assignees[assigneeIndex].workflow = workflow.filter((s) => s.stepId !== stepId);

  if (task.assignees[assigneeIndex].workflow.length === initialLength) {
    throw new AppError('Workflow step not found', STATUS_CODES.NOT_FOUND);
  }

  // Recalculate progress
  const newWorkflow = task.assignees[assigneeIndex].workflow;
  const completedSteps = newWorkflow.filter((s) => s.done).length;
  const totalSteps = newWorkflow.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  task.assignees[assigneeIndex].progress = progress;

  // Update status
  if (progress === 100 && totalSteps > 0) {
    task.assignees[assigneeIndex].status = 'completed';
    task.assignees[assigneeIndex].completedAt = new Date();
  } else if (progress > 0) {
    task.assignees[assigneeIndex].status = 'in-progress';
  } else {
    task.assignees[assigneeIndex].status = 'pending';
  }

  await task.save();

  sendSuccess(res, STATUS_CODES.OK, 'Workflow step deleted successfully', {
    progress,
    status: task.assignees[assigneeIndex].status,
  });
});
