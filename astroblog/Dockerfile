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
COPY --from=builder /app/package.json ./package.json

# Expose the port
EXPOSE 3000

# Start the server
ENV HOST="0.0.0.0"
ENV PORT=3000
ENV NODE_ENV=production

# Create a start script
RUN echo "#!/bin/sh\nnode ./dist/server/entry.mjs --host 0.0.0.0" > start.sh && \
    chmod +x start.sh

# Use the start script
CMD ["./start.sh"]