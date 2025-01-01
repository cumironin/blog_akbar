FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Add serve as a dependency
RUN pnpm add serve

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

EXPOSE 3001

# Use serve from node_modules
CMD ["./node_modules/.bin/serve", "-s", "dist", "-l", "3001"]