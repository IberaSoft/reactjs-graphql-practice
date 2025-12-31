# Multi-stage Dockerfile for Backend

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Stage 2: Development
FROM node:20-alpine AS development
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Expose port
EXPOSE 4000

# Start development server
CMD ["npm", "run", "dev"]

# Stage 3: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application (if needed)
# RUN npm run build

# Stage 4: Production
FROM node:20-alpine AS production
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /app/src ./src
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/.well-known/apollo/server-health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start production server
CMD ["node", "src/index.js"]

