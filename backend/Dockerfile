# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Debug: List files before build
RUN ls -la

# Run build
RUN pnpm run build

# Debug: List files after build to see output directory
RUN ls -la dist/

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets and dependencies from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/drizzle /app/drizzle
COPY package.json .

# Expose the port that matches your nginx conf
EXPOSE 5000

# Start the server (adjust the path based on your build output)
CMD ["node", "dist/index.js"]
