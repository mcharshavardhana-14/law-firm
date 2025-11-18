import { Response } from 'express';
import { User } from '../models/postgres';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all users
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, status } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password', 'mfaSecret'] },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        total: users.length,
      },
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'mfaSecret'] },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};

// Create user
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, phone, firmId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      firmId,
      status: 'active',
      loginAttempts: 0,
      mfaEnabled: false,
    });

    logger.info(`User created: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    await user.update(updates);

    logger.info(`User updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Don't allow deleting yourself
    if (id === req.userId) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
      return;
    }

    await user.destroy();

    logger.info(`User deleted: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};
