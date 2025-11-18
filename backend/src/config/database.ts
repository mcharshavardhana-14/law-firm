import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Connection
export const sequelize = new Sequelize({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'legal_case_management',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// MongoDB Connection
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/legal_case_management';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Redis Connection
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

// Elasticsearch Connection
export const elasticsearch = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_USERNAME
    ? {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD || '',
      }
    : undefined,
});

// Test database connections
export const testDatabaseConnections = async (): Promise<void> => {
  try {
    // Test PostgreSQL
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');

    // Test Elasticsearch
    const esHealth = await elasticsearch.cluster.health();
    console.log('Elasticsearch connected successfully:', esHealth.status);
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw error;
  }
};

// Sync database models
export const syncDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Database sync error:', error);
    throw error;
  }
};
