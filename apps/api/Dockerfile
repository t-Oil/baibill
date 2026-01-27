# Build stage
FROM node:22-alpine AS builder

# Install security updates
RUN apk upgrade --no-cache && \
    apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --include=dev

# Copy application code
COPY . .

# Build the application
RUN npm run build && \
    npm prune --production

# Production stage
FROM node:22-alpine

# Install security updates and necessary tools
RUN apk upgrade --no-cache && \
    apk add --no-cache dumb-init wget && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nestjs && \
    adduser -S nestjs -u 1001 -G nestjs

# Set working directory
WORKDIR /app

# Copy built application and production dependencies
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/package*.json ./

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