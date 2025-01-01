# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY src/ ./src/
COPY drizzle/ ./drizzle/

# Run build
RUN pnpm run build

# Debug: List files in dist directory
RUN ls -la dist/

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets and dependencies from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/drizzle /app/drizzle
COPY package.json .
COPY tsconfig.json .

# Expose the port that matches your nginx conf
EXPOSE 5000

# Start the server using the correct path
CMD ["node", "--experimental-specifier-resolution=node", "dist/server.js"]
