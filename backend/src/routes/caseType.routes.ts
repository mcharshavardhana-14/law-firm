import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/postgres/User';
import * as caseTypeController from '../controllers/caseType.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all case types
router.get('/', caseTypeController.getAllCaseTypes);

// Get case type by ID
router.get('/:id', caseTypeController.getCaseTypeById);

// Create case type (Admin only)
router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN),
  validate([
    body('name').notEmpty().trim(),
    body('description').optional().trim(),
    body('relevantLegalActs').optional().isArray(),
  ]),
  caseTypeController.createCaseType
);

// Update case type (Admin only)
router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN),
  caseTypeController.updateCaseType
);

// Delete case type (Admin only)
router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN),
  caseTypeController.deleteCaseType
);

export default router;
