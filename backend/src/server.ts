import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { sequelize, connectMongoDB, testDatabaseConnections } from './config/database';
import { config } from './config';
import logger from './utils/logger';
import './models/postgres'; // Import models to set up associations

// Import routes
import authRoutes from './routes/auth.routes';
import caseTypeRoutes from './routes/caseType.routes';
import projectRoutes from './routes/project.routes';
import documentRoutes from './routes/document.routes';
import analysisRoutes from './routes/analysis.routes';
import userRoutes from './routes/user.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/case-types', caseTypeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/users', userRoutes);

// API documentation route
app.get('/api-docs', (req: Request, res: Response) => {
  res.json({
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      caseTypes: '/api/case-types',
      projects: '/api/projects',
      documents: '/api/documents',
      analysis: '/api/analysis',
      users: '/api/users',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', err);

  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'development' ? err.message : 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connections
    await testDatabaseConnections();

    // Connect to MongoDB
    await connectMongoDB();

    // Sync database models
    await sequelize.sync({ alter: config.nodeEnv === 'development' });
    logger.info('Database synchronized');

    // Start listening
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
      console.log(`🚀 Server started at http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
