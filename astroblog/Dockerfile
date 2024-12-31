FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy all package files first
COPY package*.json pnpm-lock.yaml ./

# Install ALL dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build with production environment
RUN NODE_ENV=production pnpm build

EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"]