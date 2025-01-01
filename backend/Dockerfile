FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and config
COPY package*.json ./
# COPY tsconfig*.json ./
COPY tsconfig.build.json ./


# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build
RUN pnpm run build

# Start the server
CMD ["node", "dist/src/server.js"]