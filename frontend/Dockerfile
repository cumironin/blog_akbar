# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Install build tools and dependencies
RUN apk add --no-cache make gcc g++ python3

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage - just the static files
FROM node:20-alpine

WORKDIR /app

# Copy built assets
COPY --from=build /app/dist /app/dist

# Install pnpm globally
RUN npm install -g pnpm serve

# Expose port for development purposes
EXPOSE 3001

# Start the static file server
CMD ["serve", "-s", "dist", "-l", "3001"]