# Stage 1: Build the Frontend (Vite)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build the Backend (TypeScript)
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY bin/ ./bin/
COPY web/ ./web/
RUN npm run tsc

# Stage 3: Production Runner
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built backend artifacts
COPY --from=backend-builder /app/dist ./dist

# Copy built frontend artifacts to the expected location
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose port and start
EXPOSE 3000
CMD ["node", "dist/bin/www.js"]
