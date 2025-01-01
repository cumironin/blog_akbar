# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and config files
COPY package*.json ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./

# Install dependencies
RUN pnpm install

# Copy all source code
COPY . .

# Debug: Show structure before build
RUN echo "=== Directory structure before build ===" && \
    ls -R

# Run build
RUN pnpm run build

# Debug: Show structure after build
RUN echo "=== Directory structure after build ===" && \
    ls -R

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets and dependencies from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/drizzle /app/drizzle
COPY package.json .
COPY tsconfig.json .

# Debug: Show final structure
RUN echo "=== Final directory structure ===" && \
    ls -R

# Expose the port that matches your nginx conf
EXPOSE 5000

# Try both possible paths
RUN echo "Checking for server.js files:" && \
    find /app -name "server.js"

# Start the server using the correct path
CMD ["node", "--experimental-specifier-resolution=node", "dist/server.js"]
