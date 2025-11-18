import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/postgres';
import { config } from '../config';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

// Register new user
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'intern',
      status: 'active',
      loginAttempts: 0,
      mfaEnabled: false,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
    });
  }
};

// Login
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      res.status(403).json({
        success: false,
        message: 'Account is locked. Please try again later.',
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();

      // Lock account after max attempts
      if (user.loginAttempts >= config.security.maxLoginAttempts) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + config.security.lockTime);
        user.lockUntil = lockUntil;
        await user.save();

        res.status(403).json({
          success: false,
          message: 'Account locked due to too many failed login attempts',
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
    });
  }
};

// Get current user
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user.toJSON(),
      },
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current user',
    });
  }
};

// Refresh token
export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token required',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new access token
    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

// Logout
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // In a stateless JWT system, logout is typically handled client-side
    // But we can log the event
    logger.info(`User logged out: ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
    });
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    logger.info(`Password changed for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};
