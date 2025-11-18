import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import * as projectController from '../controllers/project.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all projects
router.get('/', projectController.getAllProjects);

// Get project by ID
router.get('/:id', projectController.getProjectById);

// Create project
router.post(
  '/',
  validate([
    body('caseTypeId').isUUID(),
    body('caseNumber').notEmpty().trim(),
    body('caseTitle').notEmpty().trim(),
    body('clientNames').isArray(),
  ]),
  projectController.createProject
);

// Update project
router.put('/:id', projectController.updateProject);

// Delete project
router.delete('/:id', projectController.deleteProject);

// Get project statistics
router.get('/:id/statistics', projectController.getProjectStatistics);

export default router;
