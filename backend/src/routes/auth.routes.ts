import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Register
router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
  ]),
  authController.register
);

// Login
router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  authController.login
);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', authenticate, authController.logout);

// Change password
router.post(
  '/change-password',
  authenticate,
  validate([
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ]),
  authController.changePassword
);

export default router;
