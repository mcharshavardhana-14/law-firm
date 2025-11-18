import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/postgres/User';
import * as userController from '../controllers/user.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users (Admin only)
router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN),
  userController.getAllUsers
);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create user (Admin only)
router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN),
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('role').isIn(Object.values(UserRole)),
  ]),
  userController.createUser
);

// Update user
router.put('/:id', userController.updateUser);

// Delete user (Admin only)
router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN),
  userController.deleteUser
);

export default router;
