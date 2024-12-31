FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

EXPOSE 3001

# Install serve globally
# RUN pnpm add -g serve

CMD ["serve", "-s", "dist", "-l", "3001"]