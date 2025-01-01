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

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY package.json .

# Expose the port that matches your Astro config and nginx conf
EXPOSE 3000

# Start the server with HOST environment variable
# ENV HOST=0.0.0.0

# Start the server
# CMD ["node", "./dist/server/entry.mjs"]
CMD ["sh", "-c", "HOST=${HOST:-0.0.0.0} PORT=${PORT:-3000} node ./dist/server/entry.mjs"]
