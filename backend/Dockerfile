# Use the latest LTS Node.js Alpine image as a base
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Use pnpm to start the application
CMD ["pnpm", "start"]
