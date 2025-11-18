import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, UserRole } from '../models/postgres/User';

export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({
        success: false,
        message: 'Account is not active',
      });
      return;
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};
