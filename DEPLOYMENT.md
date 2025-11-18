# Deployment Guide

This guide explains how to deploy the Legal Case Management System.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL 14+, MongoDB 6+, Redis 7+, Elasticsearch 8+ (if not using Docker)
- Claude API key from Anthropic
- Optional: OpenAI API key

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
NODE_ENV=production
PORT=5000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=legal_case_management
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

MONGODB_URI=mongodb://localhost:27017/legal_case_management

REDIS_HOST=localhost
REDIS_PORT=6379

ELASTICSEARCH_NODE=http://localhost:9200

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AI Services
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key

# File Storage
STORAGE_TYPE=local
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=157286400
MAX_PAGES_PER_DOCUMENT=500
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Docker Deployment (Recommended)

### 1. Set Environment Variables

Create a `.env` file in the root directory:

```env
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 2. Build and Start Services

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

### 3. Access the Application

- Frontend: http://localhost
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## Manual Deployment

### Backend

```bash
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run database migrations
npm run migrate

# Start server
npm start
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with a static file server (e.g., nginx)
# Copy the contents of 'dist' to your web server
```

## Production Considerations

### Security

1. **Change Default Secrets**: Update all default passwords and secrets
2. **Enable HTTPS**: Use SSL/TLS certificates (Let's Encrypt recommended)
3. **Firewall**: Configure firewall rules to restrict access
4. **Database Security**: Enable authentication and use strong passwords
5. **Rate Limiting**: Configure rate limiting in production
6. **CORS**: Update CORS settings for your production domain

### Performance

1. **Database Indexes**: Ensure proper database indexing
2. **Caching**: Configure Redis caching strategies
3. **Load Balancing**: Use a load balancer for high traffic
4. **CDN**: Use a CDN for static assets
5. **Monitoring**: Set up monitoring and logging (e.g., PM2, Winston)

### Backups

1. **Database Backups**: Set up automated database backups
   ```bash
   # PostgreSQL backup
   pg_dump legal_case_management > backup.sql

   # MongoDB backup
   mongodump --db legal_case_management --out /backup
   ```

2. **File Backups**: Backup uploaded documents regularly

### Scaling

1. **Horizontal Scaling**: Use Docker Swarm or Kubernetes
2. **Database Replication**: Set up master-slave replication
3. **Queue Workers**: Use separate workers for AI processing
4. **Object Storage**: Move to S3 or similar for file storage

## Health Checks

```bash
# Backend health check
curl http://localhost:5000/health

# Database connections
docker-compose exec backend npm run test-connections
```

## Troubleshooting

### Backend won't start

1. Check database connections
2. Verify environment variables
3. Check logs: `docker-compose logs backend`

### Frontend can't connect to backend

1. Verify VITE_API_URL is correct
2. Check CORS settings
3. Ensure backend is running

### Document upload fails

1. Check file size limits
2. Verify upload directory permissions
3. Check available disk space

## Monitoring

Set up monitoring for:

- Server CPU and memory usage
- Database performance
- API response times
- Error rates
- Storage usage

## Support

For issues and questions, please contact the development team.
