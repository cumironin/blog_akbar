FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and config first
COPY package.json pnpm-lock.yaml* ./
COPY tsconfig.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN pnpm run build

# Start the server
CMD ["node", "--experimental-specifier-resolution=node", "dist/server.js"]