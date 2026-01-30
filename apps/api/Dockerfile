# Build stage
FROM node:22-alpine AS builder

# Install security updates and build tools
RUN apk upgrade --no-cache && \
    apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy root package files (for workspace)
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install ALL dependencies (including dev) for building
RUN npm ci --workspace=apps/api

# Copy application code
COPY apps/api ./apps/api

# Build the application
WORKDIR /app/apps/api
RUN npm run build

# Production dependencies stage
FROM node:22-alpine AS deps

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install only production dependencies
RUN npm ci --workspace=apps/api --omit=dev

# Production stage
FROM node:22-alpine

# Install security updates and necessary tools
RUN apk upgrade --no-cache && \
    apk add --no-cache dumb-init wget && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nestjs && \
    adduser -S nestjs -u 1001 -G nestjs

# Set working directory to match monorepo structure
WORKDIR /app/apps/api

# Copy production dependencies from deps stage
COPY --from=deps --chown=nestjs:nestjs /app/node_modules /app/node_modules
COPY --from=deps --chown=nestjs:nestjs /app/apps/api/node_modules ./node_modules
COPY --from=deps --chown=nestjs:nestjs /app/package*.json /app/
COPY --from=deps --chown=nestjs:nestjs /app/apps/api/package*.json ./

# Copy built application from builder
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/dist ./dist

# Create necessary directories with proper permissions
RUN mkdir -p /tmp/uploads && \
    chown -R nestjs:nestjs /tmp/uploads

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health/check || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
