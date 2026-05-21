# Store API Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY store/package*.json ./
RUN npm ci --production

# Copy source
COPY store/ ./

# Environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["npm", "start"]