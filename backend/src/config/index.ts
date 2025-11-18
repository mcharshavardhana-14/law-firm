import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000'),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'legal_case_management',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/legal_case_management',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },

  // Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret',
  },

  // File Storage
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '157286400'), // 150MB
    maxPagesPerDocument: parseInt(process.env.MAX_PAGES_PER_DOCUMENT || '500'),
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
  },

  // AI Services
  ai: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
  },

  // OCR
  ocr: {
    service: process.env.OCR_SERVICE || 'tesseract',
    googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    googleCloudCredentialsPath: process.env.GOOGLE_CLOUD_CREDENTIALS_PATH,
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@legalcms.com',
  },

  // Security
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    lockTime: parseInt(process.env.LOCK_TIME || '15'), // minutes
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },
};

export default config;
