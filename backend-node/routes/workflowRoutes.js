import express from 'express';
import {
  getWorkflow,
  addWorkflowStep,
  toggleWorkflowStep,
  reorderWorkflowSteps,
  deleteWorkflowStep,
} from '../controllers/workflowController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// All workflow routes require authentication
router.use(verifyAuth);

// Get user's workflow for a task
router.get('/', getWorkflow);

// Add a workflow step
router.post('/add-step', addWorkflowStep);

// Toggle a workflow step (mark done/undone)
router.patch('/toggle-step', toggleWorkflowStep);

// Reorder workflow steps
router.patch('/reorder', reorderWorkflowSteps);

// Delete a workflow step
router.delete('/step/:stepId', deleteWorkflowStep);

export default router;
