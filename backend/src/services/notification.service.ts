import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import logger from '../utils/logger';
import jwt from 'jsonwebtoken';
import { config } from '../config';

let io: SocketIOServer | null = null;

export const initializeSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logger.info(`User connected: ${userId}`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
    });

    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.info(`User ${userId} joined project ${projectId}`);
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      logger.info(`User ${userId} left project ${projectId}`);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Notification types
export enum NotificationType {
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_PROCESSED = 'document_processed',
  ANALYSIS_STARTED = 'analysis_started',
  ANALYSIS_COMPLETED = 'analysis_completed',
  ANALYSIS_FAILED = 'analysis_failed',
  PROJECT_UPDATED = 'project_updated',
  USER_ASSIGNED = 'user_assigned',
  HEARING_REMINDER = 'hearing_reminder',
  COMMENT_ADDED = 'comment_added',
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
  read: boolean;
}

// Send notification to specific user
export const sendNotificationToUser = (userId: string, notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot send notification');
    return;
  }

  const fullNotification: Notification = {
    id: Date.now().toString(),
    ...notification,
    createdAt: new Date(),
    read: false,
  };

  io.to(`user:${userId}`).emit('notification', fullNotification);
  logger.info(`Notification sent to user ${userId}: ${notification.type}`);
};

// Send notification to all users in a project
export const sendNotificationToProject = (projectId: string, notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot send notification');
    return;
  }

  const fullNotification: Notification = {
    id: Date.now().toString(),
    ...notification,
    createdAt: new Date(),
    read: false,
  };

  io.to(`project:${projectId}`).emit('notification', fullNotification);
  logger.info(`Notification sent to project ${projectId}: ${notification.type}`);
};

// Send broadcast notification to all connected users
export const sendBroadcastNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot send notification');
    return;
  }

  const fullNotification: Notification = {
    id: Date.now().toString(),
    ...notification,
    createdAt: new Date(),
    read: false,
  };

  io.emit('notification', fullNotification);
  logger.info(`Broadcast notification sent: ${notification.type}`);
};

// Send real-time updates for document analysis progress
export const sendAnalysisProgress = (userId: string, documentId: string, progress: number, status: string) => {
  if (!io) return;

  io.to(`user:${userId}`).emit('analysis:progress', {
    documentId,
    progress,
    status,
  });
};
