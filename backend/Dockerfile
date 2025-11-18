# Backend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads/documents

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]
