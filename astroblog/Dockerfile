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

# Build the Astro application
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files and built assets
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod

# Expose port 3000 (matches your astro.config.mjs port)
EXPOSE 3000

# Start the application
CMD ["node", "./dist/server/entry.mjs"]
