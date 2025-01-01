# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Run migrations and build
# RUN npm run migration:generate && \
#     npm run build

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

# Start the server
CMD ["node", "dist/server.js"]
