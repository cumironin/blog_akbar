FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Install serve globally
RUN npm install -g serve

# Copy source code
COPY . .

# Build the application
RUN pnpm build

EXPOSE 3001

CMD ["serve", "-s", "dist", "-l", "3001"]