# Multi-stage Dockerfile for backend-public (Cursala Public API)
# Stage 1: Build
# Stage 2: Production runtime
# 
# This backend does NOT serve static files - all media is served via Bunny CDN

FROM node:24-alpine AS builder
LABEL environment="preview"
WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM node:24-alpine AS runner
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy compiled code
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p /app/logs

# Security: Add non-root user (commented until volume permissions are configured)
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
#     chown -R appuser:appgroup /app/logs
# USER appuser

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

# Start application
CMD ["npm", "run", "prod"]
