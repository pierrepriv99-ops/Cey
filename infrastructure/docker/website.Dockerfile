# CryOS Website Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY website/package*.json ./
RUN npm ci

# Copy source
COPY website/ ./

# Build
RUN npm run build

# Production runner
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start
CMD ["npm", "start"]