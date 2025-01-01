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
COPY src/ ./src/
COPY drizzle/ ./drizzle/

# Debug: Show contents before build
RUN echo "Contents before build:" && ls -la

# Run build
RUN pnpm run build

# Debug: Show contents after build
RUN echo "Contents after build:" && ls -la
RUN echo "Contents of dist directory:" && ls -la dist/

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets and dependencies from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/drizzle /app/drizzle
COPY package.json .
COPY tsconfig.json .
COPY drizzle.config.ts .

# Debug: Show contents in production
RUN echo "Contents in production:" && ls -la
RUN echo "Contents of dist in production:" && ls -la dist/

# Expose the port that matches your nginx conf
EXPOSE 5000

# Start the server using the correct path
CMD ["node", "--experimental-specifier-resolution=node", "dist/src/server.js"]
